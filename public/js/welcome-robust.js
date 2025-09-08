// Adicionar cliente Socket.io
// Certifique-se de incluir o script do Socket.io no HTML:
// <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
let socket;
let visitorMarker;
let otherVisitorMarkers = {};
let map;
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
};


console.log('%c[MapChat] 📜 FINAL DO SCRIPT ALCANÇADO', 'color: purple; font-size: 14px;');
console.log('[MapChat] 🧪 window.perguntas:', window.perguntas);