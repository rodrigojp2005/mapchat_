// Presença sem WebSocket: apenas HTTP polling
let visitorMarker;
let otherVisitorMarkers = {};
let otherVisitorEmojis = {}; // mapa coord->emoji
let map;
let presenceMode = null; // apenas 'poll'
let pollIntervals = { post: null, get: null };
let visitorId = null;
let currentQuestion = null;
let attempts = 0;
let maxAttempts = 5;
let gameMode = 'api'; // 'api' ou 'offline'
let markers = []; // Array para controlar os marcadores
let guessMarker = null; // Marcador do palpite atual
let confirmBtn = null; // Botão de confirmação

console.log('%c[MapChat] 🚀 JAVASCRIPT CARREGADO - VERSÃO ULTRA DEBUG', 'color: green; font-size: 18px; font-weight: bold;');
console.log('%c[MapChat] 📅 Carregado em:', 'color: green; font-weight: bold;', new Date().toLocaleString());
console.log('%c[MapChat] 🌍 URL da página:', 'color: blue;', window.location.href);
console.log('%c[MapChat] 🔧 User Agent:', 'color: blue;', navigator.userAgent);
console.log('%c[MapChat] 📱 Viewport:', 'color: blue;', `${window.innerWidth}x${window.innerHeight}`);

// Inicializa Google Maps, geolocalização e presença
function initMap() {
    try {
        console.log('%c[MapChat] 🗺️ initMap chamado', 'color: blue; font-weight: bold;');
        const mapEl = document.getElementById('map');
        if (!mapEl) {
            console.error('[MapChat] ❌ Elemento #map não encontrado');
            return;
        }

        map = new google.maps.Map(mapEl, {
            zoom: 5,
            center: { lat: -14.2350, lng: -51.9253 }, // Centro do Brasil
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            gestureHandling: 'greedy'
        });
        console.log('%c[MapChat] ✅ Mapa inicializado', 'color: green;');

        // Click no mapa para palpite (mantido para o quiz)
        map.addListener('click', (e) => {
            if (typeof showGuessMarker === 'function') {
                showGuessMarker(e.latLng.lat(), e.latLng.lng());
            }
        });

    // Geolocalização do visitante e presença via HTTP polling
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // ID único por sessão para presença HTTP
                visitorId = sessionStorage.getItem('visitorId');
                if (!visitorId) {
                    visitorId = 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
                    sessionStorage.setItem('visitorId', visitorId);
                }

                function getPseudoReal(lat, lng, minMeters, maxMeters) {
                    const earthRadius = 6371000; // metros
                    let min = minMeters;
                    let max = maxMeters;
                    if (max > 5000) min = max - 5000;
                    if (min < 500) min = 500;
                    if (max < min) max = min;
                    const randomRadius = min + Math.random() * (max - min);
                    const randomAngle = Math.random() * 2 * Math.PI;
                    const latOffset = (randomRadius / earthRadius) * (180 / Math.PI) * Math.cos(randomAngle);
                    const lngOffset = (randomRadius / earthRadius) * (180 / Math.PI) * Math.sin(randomAngle) / Math.cos(lat * Math.PI / 180);
                    return { lat: lat + latOffset, lng: lng + lngOffset };
                }

                let pseudo = getPseudoReal(userLat, userLng, 500, 1000);
                let fakeLat = pseudo.lat;
                let fakeLng = pseudo.lng;

                let precision = 0.5;
                let precisionAdjusted = false;
                if (sessionStorage.getItem('precisionAdjusted')) {
                    precisionAdjusted = true;
                    precision = parseFloat(sessionStorage.getItem('precisionValue')) || precision;
                }

                // Marcador do visitante (amarelo)
                visitorMarker = new google.maps.Marker({
                    position: { lat: fakeLat, lng: fakeLng },
                    map: map,
                    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }
                });
                map.setCenter({ lat: fakeLat, lng: fakeLng });

                // Ajuste de precisão
                visitorMarker.addListener('click', function () {
                    let html = `<p>O raio de sua posição está em torno de <b>${Math.round(precision * 1000)} metros</b> da sua posição pseudo real.</p>`;
                    html += `<input type='range' min='0.5' max='50' step='0.1' value='${precision}' id='precSlider' ${precisionAdjusted ? 'disabled' : ''} style='width:100%'>`;
                    html += `<div>Precisão: <span id='precValue'>${Math.round(precision * 1000)} m</span></div>`;
                    Swal.fire({
                        title: 'Sua posição aproximada',
                        html: html,
                        confirmButtonText: precisionAdjusted ? 'Fechar' : 'Ajustar precisão',
                        showCancelButton: !precisionAdjusted,
                        cancelButtonText: 'Cancelar',
                        allowOutsideClick: false,
                        didOpen: () => {
                            const slider = Swal.getHtmlContainer().querySelector('#precSlider');
                            const valueSpan = Swal.getHtmlContainer().querySelector('#precValue');
                            if (slider && valueSpan) {
                                slider.addEventListener('input', function () {
                                    valueSpan.textContent = `${Math.round(slider.value * 1000)} m`;
                                });
                            }
                        }
                    }).then((result) => {
                        if (!precisionAdjusted && result.isConfirmed) {
                            const slider = Swal.getHtmlContainer().querySelector('#precSlider');
                            if (slider) {
                                let newPrecision = parseFloat(slider.value);
                                if (newPrecision < 0.5) newPrecision = 0.5;
                                if (newPrecision > 50) newPrecision = 50;
                                precision = newPrecision;
                                let minMeters = 500;
                                let maxMeters = precision * 1000;
                                if (maxMeters > 5000) minMeters = maxMeters - 5000;
                                pseudo = getPseudoReal(userLat, userLng, minMeters, maxMeters);
                                fakeLat = pseudo.lat;
                                fakeLng = pseudo.lng;
                                visitorMarker.setPosition({ lat: fakeLat, lng: fakeLng });
                                map.setCenter({ lat: fakeLat, lng: fakeLng });
                                sessionStorage.setItem('precisionAdjusted', 'true');
                                sessionStorage.setItem('precisionValue', precision);
                                precisionAdjusted = true;
                                Swal.fire('Precisão ajustada!', `Agora o raio é de <b>${Math.round(precision * 1000)} metros</b>.`, 'success');
                                if (socket) socket.emit('visitorPosition', { lat: fakeLat, lng: fakeLng });
                            }
                        }
                    });
                });

                // Inicia presença por HTTP polling
                startPollingPresence(fakeLat, fakeLng);
            }, (error) => {
                console.warn('Geolocalização falhou:', error);
            });
        } else {
            console.warn('[MapChat] Geolocalização não suportada');
        }
    } catch (e) {
        console.error('[MapChat] ❌ Erro em initMap:', e);
    }
}

// Carrega uma nova pergunta e atualiza a UI
function loadNewQuestion() {
    try {
        console.log('%c[MapChat] 🧠 Carregando NOVA PERGUNTA', 'color: blue; font-weight: bold;');
        clearMap();
        resetAttempts();

        const questionElement = document.getElementById('question-text');
        const categoryElement = document.getElementById('category');
        const hintElement = document.getElementById('hint');

        // Preferir perguntas pré-carregadas (sem depender de API)
        if (Array.isArray(window.perguntas) && window.perguntas.length > 0) {
            const idx = Math.floor(Math.random() * window.perguntas.length);
            currentQuestion = window.perguntas[idx];
            gameMode = 'offline';
            console.log('[MapChat] 🎲 Selecionada pergunta local:', currentQuestion);
            if (questionElement) questionElement.textContent = currentQuestion.question_text || 'Pergunta';
            if (categoryElement) categoryElement.textContent = currentQuestion.category || 'Geografia';
            if (hintElement) {
                hintElement.classList.remove('hidden');
                const creator = currentQuestion.user_name || 'anônimo';
                hintElement.innerHTML = `<b>Pergunta criada:</b> ${creator}`;
            }
            if (typeof startTimer === 'function') startTimer();
            return;
        }

        // Fallback: buscar da API
        console.log('[MapChat] 🌐 Buscando pergunta via API...');
        fetch('/api/question/random', { headers: { 'Accept': 'application/json' }})
            .then(async (r) => {
                const text = await r.text();
                try {
                    return { ok: r.ok, status: r.status, data: JSON.parse(text) };
                } catch (e) {
                    console.error('[MapChat] ❌ API random respondeu texto não-JSON:', text);
                    throw new Error('Resposta inválida da API');
                }
            })
            .then(({ ok, status, data }) => {
                if (!ok) throw new Error(`API /question/random ${status}`);
                currentQuestion = data;
                // Se API indicou modo quiz, não usamos a rota de guess (offline)
                gameMode = (data && data.debug && data.debug.mode === 'api') ? 'api' : 'offline';
                console.log('[MapChat] ✅ Pergunta da API:', currentQuestion, 'mode=', gameMode);
                if (questionElement) questionElement.textContent = currentQuestion.question_text || 'Pergunta';
                if (categoryElement) categoryElement.textContent = currentQuestion.category || 'Geografia';
                if (hintElement) {
                    hintElement.classList.remove('hidden');
                    const creator = currentQuestion.user_name || 'anônimo';
                    hintElement.innerHTML = `<b>Pergunta criada:</b> ${creator}`;
                }
                if (typeof startTimer === 'function') startTimer();
            })
            .catch((err) => {
                console.error('[MapChat] ❌ Falha ao carregar pergunta:', err);
                if (questionElement) questionElement.textContent = 'Sem perguntas disponíveis agora';
                if (categoryElement) categoryElement.textContent = '—';
            });
    } catch (e) {
        console.error('[MapChat] ❌ Erro em loadNewQuestion:', e);
    }
}

// Renderiza visitantes azuis no mapa (usado por socket e polling)
function renderVisitors(visitors, selfLat, selfLng) {
    Object.values(otherVisitorMarkers).forEach(m => m.setMap(null));
    otherVisitorMarkers = {};
    const pool = ['🟣','🟡','🟢','🔵','🧭','📍','🎯','⭐','🔥','🍀','🌟','🛰️','🚀','🐱','🐶','🐼','🦊','🐧','🐸','🦄','🐵','🦁','🐯','🐨'];
    const size = 36;
    (visitors || []).forEach(v => {
        if (Math.abs(v.lat - selfLat) < 1e-9 && Math.abs(v.lng - selfLng) < 1e-9) return;
        const key = `${v.lat},${v.lng}`;
        if (!otherVisitorEmojis[key]) {
            otherVisitorEmojis[key] = pool[Math.floor(Math.random() * pool.length)];
        }
        const m = new google.maps.Marker({
            position: { lat: v.lat, lng: v.lng },
            map: map,
            icon: makeEmojiIcon(otherVisitorEmojis[key], size),
            title: 'Outro visitante'
        });
        otherVisitorMarkers[key] = m;
    });
}

// Cria um ícone SVG com um emoji centralizado
function makeEmojiIcon(emoji, size) {
    const fontSize = Math.floor(size * 0.8);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${fontSize}">${emoji}</text>
</svg>`;
    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    return {
        url,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2)
    };
}

// Presença via HTTP polling (sem sockets)
function startPollingPresence(selfLat, selfLng) {
    if (presenceMode === 'poll') return;
    presenceMode = 'poll';
    console.log('[MapChat] 🔄 Presença via HTTP polling');

    // envia posição imediatamente e a cada 10s
    const postOnce = () => {
        fetch('/api/user-position', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ id: visitorId, lat: selfLat, lng: selfLng })
        }).catch(err => console.warn('[MapChat] ⚠️ Falha ao enviar posição:', err));
    };
    postOnce();
    pollIntervals.post = setInterval(postOnce, 10000);

    // busca visitantes imediatamente e a cada 5s
    const getOnce = () => {
        fetch('/api/user-positions', { headers: { 'Accept': 'application/json' }})
            .then(r => r.ok ? r.json() : [])
            .then(list => renderVisitors(list, selfLat, selfLng))
            .catch(err => console.warn('[MapChat] ⚠️ Falha ao buscar visitantes:', err));
    };
    getOnce();
    pollIntervals.get = setInterval(getOnce, 5000);
}

function stopPollingPresence() {
    if (pollIntervals.post) clearInterval(pollIntervals.post);
    if (pollIntervals.get) clearInterval(pollIntervals.get);
    pollIntervals = { post: null, get: null };
}


// Fazer palpite
async function makeGuess(lat, lng) {
    console.log('%c[MapChat] 🎯 FAZENDO PALPITE', 'color: orange; font-size: 14px;');
    console.log('[MapChat] 📍 Coordenadas do palpite:', { lat, lng });
    console.log('[MapChat] ❓ Pergunta atual:', currentQuestion);
    
    if (!currentQuestion) {
        console.error('%c[MapChat] ❌ NENHUMA PERGUNTA ATUAL!', 'color: red;');
        return;
    }

    attempts++;
    console.log('[MapChat] 🔢 Tentativa:', attempts, '/', maxAttempts);
    updateAttemptsDisplay();

    let result;
    
    if (gameMode === 'api') {
        console.log('%c[MapChat] 🌐 TENTANDO PALPITE VIA API...', 'color: blue;');
        try {
            result = await makeApiGuess(lat, lng);
            console.log('%c[MapChat] ✅ RESULTADO API:', 'color: green;', result);
        } catch (error) {
            console.error('%c[MapChat] ❌ API GUESS FALHOU:', 'color: red;', error);
            console.warn('%c[MapChat] 🔄 CALCULANDO OFFLINE...', 'color: orange;');
            result = makeOfflineGuess(lat, lng);
        }
    } else {
        console.log('%c[MapChat] 📱 CALCULANDO PALPITE OFFLINE...', 'color: purple;');
        result = makeOfflineGuess(lat, lng);
    }

    console.log('%c[MapChat] 🎯 RESULTADO FINAL:', 'color: blue; font-weight: bold;', result);
    processGuessResult(result, lat, lng);
}

// Fazer palpite via API
async function makeApiGuess(lat, lng) {
    console.log('%c[MapChat] 🌐 FAZENDO PALPITE VIA API', 'color: blue;');
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    console.log('[MapChat] 🔑 CSRF Token elemento:', csrfToken);
    console.log('[MapChat] 🔑 CSRF Token valor:', csrfToken ? csrfToken.getAttribute('content') : 'NÃO ENCONTRADO');
    
    const payload = {
        question_id: currentQuestion.id,
        lat: lat,
        lng: lng
    };
    console.log('[MapChat] 📦 Payload do palpite:', payload);
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    
    if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
    }
    
    console.log('[MapChat] 📨 Headers da requisição:', headers);
    
    const response = await fetch('/api/question/guess', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    console.log('[MapChat] 📨 Response do palpite:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[MapChat] ❌ Erro da API guess:', errorText);
        throw new Error(`API erro: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('[MapChat] 📄 Response text:', responseText);
    
    const result = JSON.parse(responseText);
    console.log('[MapChat] ✅ Resultado parseado:', result);
    
    return result;
}

// Fazer palpite offline
function makeOfflineGuess(lat, lng) {
    const distance = haversine(lat, lng, currentQuestion.answer_lat, currentQuestion.answer_lng);
    const correct = distance < 10; // 10km de tolerância
    const direction = getDirection(lat, lng, currentQuestion.answer_lat, currentQuestion.answer_lng);

    return {
        correct: correct,
        distance: Math.round(distance * 100) / 100,
        direction: direction,
        hint: correct ? null : currentQuestion.hint
    };
}

// Processar resultado do palpite
function processGuessResult(result, lat, lng) {
    // Adicionar marcador no mapa
    addMarker(lat, lng, result.correct);
    
    if (result.correct) {
        hideTimer();
        Swal.fire({
            title: '🎉 Parabéns!',
            html: `
                <p><strong>Você acertou!</strong></p>
                <p><strong>Distância:</strong> ${result.distance}km em ${attempts} tentativa(s)</p>
            `,
            icon: 'success',
            confirmButtonText: 'Próxima pergunta'
        }).then(() => {
            loadNewQuestion();
        });
    } else if (attempts >= maxAttempts) {
        hideTimer();
        // Mostrar resposta correta
        addMarker(currentQuestion.answer_lat, currentQuestion.answer_lng, true, 'Resposta Correta');
        
        Swal.fire({
            title: '😅 Não foi dessa vez!',
            html: `
                <p><strong>Resposta:</strong> ${currentQuestion.hint}</p>
                <p><strong>Tentativas:</strong> ${attempts}/${maxAttempts}</p>
                <p><strong>Última distância:</strong> ${result.distance}km ${result.direction}</p>
            `,
            icon: 'info',
            confirmButtonText: 'Próxima pergunta'
        }).then(() => {
            loadNewQuestion();
        });
    } else {
        Swal.fire({
            title: '🎯 Continue tentando!',
            html: `
                <p><strong>Distância:</strong> ${result.distance}km ${result.direction}</p>
                <p><strong>Dica:</strong> ${result.hint}</p>
                <p><strong>Tentativas:</strong> ${attempts}/${maxAttempts}</p>
            `,
            icon: 'warning',
            confirmButtonText: 'Tentar novamente'
        });
    }
}

// Função Haversine para calcular distância offline
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calcular direção offline
function getDirection(lat1, lon1, lat2, lon2) {
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const angle = Math.atan2(dLon, dLat) * 180 / Math.PI;
    const directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
    const index = Math.round(((angle + 360) % 360) / 45) % 8;
    return directions[index];
}

// Funções auxiliares (reutilizadas do código original)
function addMarker(lat, lng, isCorrect, title = '') {
    // Marcador de resposta correta (verde)
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title,
        icon: {
            url: isCorrect ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });
    markers.push(marker);
}

function showGuessMarker(lat, lng) {
    // Remove marcador anterior se existir
    if (guessMarker) {
        guessMarker.setMap(null);
        guessMarker = null;
    }
    // Remove botão anterior se existir
    if (confirmBtn) {
        confirmBtn.remove();
        confirmBtn = null;
    }
    // Adiciona novo marcador de palpite
    guessMarker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });
    // Adiciona botão de confirmação
    confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirmar palpite';
    confirmBtn.style.position = 'fixed';
    confirmBtn.style.left = '50%';
    confirmBtn.style.bottom = '80px';
    confirmBtn.style.transform = 'translateX(-50%)';
    confirmBtn.style.background = '#22c55e';
    confirmBtn.style.color = 'white';
    confirmBtn.style.fontWeight = 'bold';
    confirmBtn.style.fontSize = '1.2em';
    confirmBtn.style.padding = '12px 32px';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '8px';
    confirmBtn.style.zIndex = '9999';
    confirmBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    confirmBtn.style.cursor = 'pointer';
    document.body.appendChild(confirmBtn);
    confirmBtn.onclick = function() {
        // Processa o palpite e limpa o botão/marcador
        processGuess(lat, lng);
    };
}

function processGuess(lat, lng) {
    // Remove botão e marcador de palpite
    if (confirmBtn) {
        confirmBtn.remove();
        confirmBtn = null;
    }
    if (guessMarker) {
        guessMarker.setMap(null);
        guessMarker = null;
    }
    // Chama a lógica original do palpite
    makeGuess(lat, lng);
}

function clearMap() {
    console.log('%c[MapChat] 🧹 LIMPANDO MAPA - INÍCIO', 'color: orange; font-weight: bold;');
    console.log('%c[MapChat] 🧹 Marcadores para remover:', 'color: orange; font-weight: bold;', markers.length);
    
    // Limpa marcadores de resposta
    markers.forEach(marker => marker.setMap(null));
    markers.length = 0;
    // Limpa marcador de palpite
    if (guessMarker) {
        guessMarker.setMap(null);
        guessMarker = null;
    }
    // Limpa botão de confirmação
    if (confirmBtn) {
        confirmBtn.remove();
        confirmBtn = null;
    }
    console.log('%c[MapChat] ✅ MAPA LIMPO COMPLETAMENTE', 'color: green; font-weight: bold;');
}

function resetAttempts() {
    attempts = 0;
    updateAttemptsDisplay();
}

function updateAttemptsDisplay() {
    const attemptsElement = document.getElementById('attempts-count');
    if (attemptsElement) {
        attemptsElement.textContent = attempts;
    }
    
    const maxAttemptsElement = document.getElementById('max-attempts');
    if (maxAttemptsElement) {
        maxAttemptsElement.textContent = maxAttempts;
    }
}

function resetTimer() {
    console.log('%c[MapChat] ⏰ RESET TIMER solicitado', 'color: blue; font-weight: bold;');
    
    // Resetar timer na navegação
    if (typeof startTimer === 'function') {
        startTimer();
        console.log('%c[MapChat] ✅ Timer iniciado com sucesso', 'color: green;');
    } else {
        console.error('%c[MapChat] ❌ Função startTimer não encontrada', 'color: red;');
    }
}

function hideTimer() {
    console.log('%c[MapChat] ⏰ HIDE TIMER solicitado', 'color: blue; font-weight: bold;');
    
    // Parar timer na navegação
    if (typeof stopTimer === 'function') {
        stopTimer();
        console.log('%c[MapChat] ✅ Timer parado com sucesso', 'color: green;');
    } else {
        console.error('%c[MapChat] ❌ Função stopTimer não encontrada', 'color: red;');
    }
}

// Função chamada quando o tempo acaba
function onTimerEnd() {
    console.log('%c[MapChat] ⏰ TEMPO ESGOTADO!', 'color: red; font-weight: bold;');
    
    if (!currentQuestion) return;
    
    // Mostrar resposta correta
    addMarker(currentQuestion.answer_lat, currentQuestion.answer_lng, true, 'Resposta Correta - Tempo Esgotado');
    
    Swal.fire({
        title: '⏰ Tempo esgotado!',
        html: `
            <p><strong>Resposta:</strong> ${currentQuestion.hint}</p>
            <p><strong>Tempo:</strong> 45 segundos</p>
            <p><strong>Tentativas:</strong> ${attempts}/${maxAttempts}</p>
        `,
        icon: 'warning',
        confirmButtonText: 'Próxima pergunta'
    });
}

function zoomIn() {
    if (map) map.setZoom(map.getZoom() + 1);
}

function zoomOut() {
    if (map) map.setZoom(map.getZoom() - 1);
}

// Função global para Google Maps callback
window.initMap = initMap;

// Inicializar quando a página carregar
window.onload = function() {
    console.log('%c[MapChat] 📄 PÁGINA CARREGADA COMPLETAMENTE', 'color: blue; font-size: 16px;');
    console.log('[MapChat] ⏰ Timestamp:', new Date().toISOString());
    console.log('[MapChat] 🗺️ Aguardando Google Maps carregar...');
    // Verificar elementos importantes
    const mapElement = document.getElementById('map');
    const questionElement = document.getElementById('question-text');
    const categoryElement = document.getElementById('category');
    console.log('[MapChat] 🧩 Elementos DOM encontrados:', {
        map: !!mapElement,
        questionText: !!questionElement,
        category: !!categoryElement,
        mapDimensions: mapElement ? `${mapElement.offsetWidth}x${mapElement.offsetHeight}` : 'N/A'
    });
    // Carregar primeira pergunta
    loadNewQuestion();
};


console.log('%c[MapChat] 📜 FINAL DO SCRIPT ALCANÇADO', 'color: purple; font-size: 14px;');
console.log('[MapChat] 🧪 window.perguntas:', window.perguntas);