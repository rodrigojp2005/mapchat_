let map;
let currentQuestion = null;
let attempts = 0;
let maxAttempts = 5;
let gameMode = 'api'; // 'api' ou 'offline'
let markers = []; // Array para controlar os marcadores

console.log('%c[MapChat] 🚀 JAVASCRIPT CARREGADO - VERSÃO ULTRA DEBUG', 'color: green; font-size: 18px; font-weight: bold;');
console.log('%c[MapChat] 📅 Carregado em:', 'color: green; font-weight: bold;', new Date().toLocaleString());
console.log('%c[MapChat] 🌍 URL da página:', 'color: blue;', window.location.href);
console.log('%c[MapChat] 🔧 User Agent:', 'color: blue;', navigator.userAgent);
console.log('%c[MapChat] 📱 Viewport:', 'color: blue;', `${window.innerWidth}x${window.innerHeight}`);

// Perguntas offline (backup caso API falhe)
const offlineQuestions = [
    {
        id: 1,
        question_text: 'Qual cidade ficou mundialmente conhecida por um "visitante" extraterrestre em 1996?',
        category: 'UFO',
        hint: 'ET Bilu mandou buscar conhecimento aqui!',
        answer_lat: -21.5554,
        answer_lng: -45.4297,
        user_name: 'Admin MapChat'
    },
    {
        id: 2,
        question_text: 'Em qual cidade você encontraria o famoso "Pão de Açúcar"?',
        category: 'Turismo',
        hint: 'Cidade maravilhosa, cheia de encantos mil!',
        answer_lat: -22.9068,
        answer_lng: -43.1729,
        user_name: 'Admin MapChat'
    },
    {
        id: 3,
        question_text: 'Onde fica o "umbigo do mundo" segundo os paulistanos?',
        category: 'Humor',
        hint: 'Terra da garoa e do trânsito infinito!',
        answer_lat: -23.5505,
        answer_lng: -46.6333,
        user_name: 'Admin MapChat'
    },
    {
        id: 4,
        question_text: 'Em qual cidade você pode visitar as famosas Cataratas e ainda ouvir "Iguaçu Falls" em três idiomas?',
        category: 'Natureza',
        hint: 'Tríplice fronteira com muito barulho de água!',
        answer_lat: -25.5163,
        answer_lng: -54.5854,
        user_name: 'Admin MapChat'
    },
    {
        id: 5,
        question_text: 'Qual cidade é famosa por ter mais bois que gente e ser a capital do agronegócio?',
        category: 'Agronegócio',
        hint: 'No coração do Pantanal, onde o boi é rei!',
        answer_lat: -15.6014,
        answer_lng: -56.0979,
        user_name: 'Admin MapChat'
    },
    {
        id: 6,
        question_text: 'Em que cidade você pode "voar" de asa delta e depois tomar uma caipirinha na praia?',
        category: 'Aventura',
        hint: 'Do alto da Pedra Bonita se vê o mar!',
        answer_lat: -22.9068,
        answer_lng: -43.1729,
        user_name: 'Admin MapChat'
    },
    {
        id: 7,
        question_text: 'Qual cidade tem o maior carnaval fora de época do Brasil e todo mundo vira "axé music"?',
        category: 'Festa',
        hint: 'Terra da música baiana e do acarajé!',
        answer_lat: -12.9714,
        answer_lng: -38.5014,
        user_name: 'Admin MapChat'
    },
    {
        id: 8,
        question_text: 'Em qual cidade você pode almoçar no Brasil e jantar no Uruguai no mesmo dia?',
        category: 'Fronteira',
        hint: 'Cidade gêmea onde se fala "portunhol"!',
        answer_lat: -32.0346,
        answer_lng: -52.0985,
        user_name: 'Admin MapChat'
    },
    {
        id: 9,
        question_text: 'Qual cidade é conhecida como a "Suíça brasileira" mas tem mais montanha-russa que neve?',
        category: 'Turismo',
        hint: 'No inverno fica cheio de paulista tentando ver neve!',
        answer_lat: -22.7386,
        answer_lng: -45.5908,
        user_name: 'Admin MapChat'
    },
    {
        id: 10,
        question_text: 'Em que cidade você pode tomar banho de rio e ainda ver um encontro das águas que parece mágica?',
        category: 'Natureza',
        hint: 'Portal da Amazônia, onde rios se abraçam!',
        answer_lat: -3.1190,
        answer_lng: -60.0217,
        user_name: 'Admin MapChat'
    }
];

let usedQuestions = [];

// Inicializar Google Maps
function initMap() {
    console.log('%c[MapChat] 🗺️ Inicializando Google Maps', 'color: blue; font-weight: bold;');
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: -14.2350, lng: -51.9253 }, // Centro do Brasil
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        gestureHandling: 'greedy' // Permite touch com um dedo
    });

    console.log('%c[MapChat] ✅ Mapa configurado com gestureHandling: greedy', 'color: green;');

    // Adicionar listener para cliques no mapa
    map.addListener('click', function(e) {
        console.log('%c[MapChat] 👆 Clique no mapa:', 'color: purple;', e.latLng.lat(), e.latLng.lng());
        makeGuess(e.latLng.lat(), e.latLng.lng());
    });

    // Carregar primeira pergunta
    loadNewQuestion();
}

// Carregar nova pergunta (com fallback)
async function loadNewQuestion() {
    console.log('%c[MapChat] 🔄 CARREGANDO NOVA PERGUNTA...', 'color: orange; font-size: 16px; font-weight: bold;');
    
    // LIMPAR MAPA PRIMEIRO (antes de tudo)
    clearMap();
    
    try {
        console.log('%c[MapChat] 🌐 Tentando carregar via API...', 'color: blue;');
        
        // Tentar API primeiro
        const response = await fetch('/api/question/random', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('%c[MapChat] � Resposta da API:', 'color: blue;', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('%c[MapChat] � Dados recebidos da API:', 'color: green;', data);
            currentQuestion = data;
            gameMode = 'api';
            console.log('%c[MapChat] ✅ Pergunta carregada via API', 'color: green; font-weight: bold;');
        } else {
            throw new Error(`API retornou erro: ${response.status}`);
        }
    } catch (error) {
        console.warn('%c[MapChat] ⚠️ API falhou, usando modo offline', 'color: orange; font-weight: bold;', error);
        // Fallback para modo offline
        loadOfflineQuestion();
    }

    if (currentQuestion) {
        console.log('%c[MapChat] 📝 ATUALIZANDO DISPLAY COM PERGUNTA:', 'color: blue;', currentQuestion);
        updateQuestionDisplay();
        resetAttempts();
        resetTimer();
        // NÃO clearMap aqui - já foi feito no início
    } else {
        console.error('%c[MapChat] ❌ NENHUMA PERGUNTA CARREGADA!', 'color: red; font-size: 16px;');
    }
}

// Carregar pergunta offline
function loadOfflineQuestion() {
    console.log('%c[MapChat] 📱 CARREGANDO PERGUNTA OFFLINE', 'color: purple; font-size: 14px;');
    console.log('[MapChat] 📊 Perguntas usadas:', usedQuestions);
    console.log('[MapChat] 📝 Total de perguntas offline:', offlineQuestions.length);
    
    // Resetar perguntas usadas se todas foram utilizadas
    if (usedQuestions.length >= offlineQuestions.length) {
        console.log('[MapChat] 🔄 Resetando perguntas usadas - todas foram utilizadas');
        usedQuestions = [];
    }

    // Filtrar perguntas não utilizadas
    const availableQuestions = offlineQuestions.filter(q => !usedQuestions.includes(q.id));
    console.log('[MapChat] 📋 Perguntas disponíveis:', availableQuestions.length);
    
    // Selecionar pergunta aleatória
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIndex];
    usedQuestions.push(currentQuestion.id);
    
    gameMode = 'offline';
    console.log('%c[MapChat] ✅ PERGUNTA OFFLINE CARREGADA:', 'color: green; font-weight: bold;', {
        id: currentQuestion.id,
        texto: currentQuestion.question_text,
        categoria: currentQuestion.category
    });
}

// Atualizar display da pergunta
function updateQuestionDisplay() {
    console.log('%c[MapChat] 📝 ATUALIZANDO DISPLAY', 'color: blue;');
    console.log('[MapChat] ❓ Pergunta para exibir:', currentQuestion);
    
    if (!currentQuestion) {
        console.error('[MapChat] ❌ Nenhuma pergunta para exibir!');
        return;
    }
    
    const questionElement = document.getElementById('question-text');
    const categoryElement = document.getElementById('category');
    
    console.log('[MapChat] 🎯 Elementos DOM:', {
        questionElement: !!questionElement,
        categoryElement: !!categoryElement
    });
    
    if (questionElement) {
        questionElement.textContent = currentQuestion.question_text;
        console.log('[MapChat] ✅ Texto da pergunta atualizado');
    } else {
        console.error('[MapChat] ❌ Elemento question-text não encontrado!');
    }
    
    if (categoryElement) {
        categoryElement.textContent = currentQuestion.category || 'Geografia';
        console.log('[MapChat] ✅ Categoria atualizada');
    } else {
        console.error('[MapChat] ❌ Elemento category não encontrado!');
    }
    
    // Mostrar nome do criador embaixo da pergunta
    const creatorName = currentQuestion.user_name || 'Admin MapChat';
    let creatorElement = document.getElementById('question-creator');
    
    if (!creatorElement) {
        // Criar elemento se não existir
        creatorElement = document.createElement('div');
        creatorElement.id = 'question-creator';
        creatorElement.className = 'text-xs text-gray-500 mt-1';
        document.getElementById('question-container').appendChild(creatorElement);
        console.log('[MapChat] ✅ Elemento criador criado');
    }
    
    creatorElement.innerHTML = `📝 Criada por: <strong>${creatorName}</strong>`;
    console.log('[MapChat] ✅ Nome do criador atualizado:', creatorName);
    
    // Mostrar indicador do modo
    const modeIndicator = gameMode === 'api' ? '🌐 Online' : '📱 Offline';
    console.log('[MapChat] 🔧 Modo do jogo:', modeIndicator);
    
    /*
    const modeElement = document.getElementById('game-mode');
    if (modeElement) {
        modeElement.textContent = modeIndicator;
        console.log('[MapChat] ✅ Indicador de modo atualizado');
    } else {
        // Criar elemento se não existir
        console.log('[MapChat] 🔧 Criando elemento de modo...');
        const newModeElement = document.createElement('div');
        newModeElement.id = 'game-mode';
        newModeElement.className = 'text-xs text-gray-400 mt-1';
        newModeElement.textContent = modeIndicator;
        
        const container = document.getElementById('question-container');
        if (container) {
            container.appendChild(newModeElement);
            console.log('[MapChat] ✅ Elemento de modo criado e adicionado');
        } else {
            console.error('[MapChat] ❌ Container question-container não encontrado!');
        }
    }
    */
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
    console.log('%c[MapChat] 📍 ADICIONANDO MARCADOR:', 'color: purple; font-weight: bold;', {lat, lng, isCorrect, title});
    console.log('%c[MapChat] 📍 Marcadores ANTES de adicionar:', 'color: purple;', markers.length);
    
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title,
        icon: {
            url: isCorrect ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });
    
    // Adicionar à lista de marcadores para controle
    markers.push(marker);
    console.log('%c[MapChat] 📍 Marcador criado e adicionado ao array', 'color: purple;');
    console.log('%c[MapChat] 📍 Total de marcadores APÓS adicionar:', 'color: purple; font-weight: bold;', markers.length);
    
    // Mostrar todos os marcadores atuais
    console.log('%c[MapChat] 📍 Lista completa de marcadores:', 'color: purple;', markers.map((m, i) => ({
        index: i,
        position: m.getPosition() ? m.getPosition().toString() : 'null',
        map: m.getMap() ? 'visível' : 'removido'
    })));
}

function clearMap() {
    console.log('%c[MapChat] 🧹 LIMPANDO MAPA - INÍCIO', 'color: orange; font-weight: bold;');
    console.log('%c[MapChat] 🧹 Marcadores para remover:', 'color: orange; font-weight: bold;', markers.length);
    
    if (markers.length === 0) {
        console.log('%c[MapChat] 🧹 Nenhum marcador para remover', 'color: orange;');
        return;
    }
    
    // Limpar todos os marcadores
    markers.forEach((marker, index) => {
        console.log('%c[MapChat] 🧹 Removendo marcador', 'color: orange;', index + 1, 'de', markers.length);
        if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
            console.log('%c[MapChat] ✅ Marcador', index + 1, 'removido com sucesso', 'color: green;');
        } else {
            console.error('%c[MapChat] ❌ Marcador', index + 1, 'inválido:', 'color: red;', marker);
        }
    });
    
    // Resetar array
    const oldLength = markers.length;
    markers.length = 0; // Limpar array
    markers.splice(0); // Garantir limpeza
    
    console.log('%c[MapChat] 🧹 Array limpo - Antes:', oldLength, 'Agora:', markers.length, 'color: orange; font-weight: bold;');
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
            <p><strong>Tempo:</strong> 30 segundos</p>
            <p><strong>Tentativas:</strong> ${attempts}/${maxAttempts}</p>
        `,
        icon: 'warning',
        confirmButtonText: 'Próxima pergunta'
    }).then(() => {
        loadNewQuestion();
    });
}

function zoomIn() {
    if (map) map.setZoom(map.getZoom() + 1);
}

function zoomOut() {
    if (map) map.setZoom(map.getZoom() - 1);
}

// Inicializar quando a página carregar
window.onload = function() {
    console.log('%c[MapChat] 📄 PÁGINA CARREGADA COMPLETAMENTE', 'color: blue; font-size: 16px;');
    console.log('[MapChat] ⏰ Timestamp:', new Date().toISOString());
    console.log('[MapChat] 🗺️ Aguardando Google Maps carregar...');
};

// Função global para Google Maps callback
window.initMap = initMap;

// Log quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c[MapChat] 🏗️ DOM PRONTO', 'color: green; font-size: 16px;');
    
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
});

console.log('%c[MapChat] 📜 FINAL DO SCRIPT ALCANÇADO', 'color: purple; font-size: 14px;');
