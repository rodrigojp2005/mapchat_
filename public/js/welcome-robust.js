let map;
let currentQuestion = null;
let attempts = 0;
let maxAttempts = 5;
let gameMode = 'api'; // 'api' ou 'offline'

console.log('%c[MapChat] JS carregado - Versão Robusta', 'color: green; font-weight: bold;', new Date().toLocaleString());

// Perguntas offline (backup caso API falhe)
const offlineQuestions = [
    {
        id: 1,
        question_text: 'Qual cidade ficou mundialmente conhecida por um "visitante" extraterrestre em 1996?',
        category: 'UFO',
        hint: 'ET Bilu mandou buscar conhecimento aqui!',
        answer_lat: -21.5554,
        answer_lng: -45.4297
    },
    {
        id: 2,
        question_text: 'Em qual cidade você encontraria o famoso "Pão de Açúcar"?',
        category: 'Turismo',
        hint: 'Cidade maravilhosa, cheia de encantos mil!',
        answer_lat: -22.9068,
        answer_lng: -43.1729
    },
    {
        id: 3,
        question_text: 'Onde fica o "umbigo do mundo" segundo os paulistanos?',
        category: 'Humor',
        hint: 'Terra da garoa e do trânsito infinito!',
        answer_lat: -23.5505,
        answer_lng: -46.6333
    },
    {
        id: 4,
        question_text: 'Em qual cidade você pode visitar as famosas Cataratas e ainda ouvir "Iguaçu Falls" em três idiomas?',
        category: 'Natureza',
        hint: 'Tríplice fronteira com muito barulho de água!',
        answer_lat: -25.5163,
        answer_lng: -54.5854
    },
    {
        id: 5,
        question_text: 'Qual cidade é famosa por ter mais bois que gente e ser a capital do agronegócio?',
        category: 'Agronegócio',
        hint: 'No coração do Pantanal, onde o boi é rei!',
        answer_lat: -15.6014,
        answer_lng: -56.0979
    },
    {
        id: 6,
        question_text: 'Em que cidade você pode "voar" de asa delta e depois tomar uma caipirinha na praia?',
        category: 'Aventura',
        hint: 'Do alto da Pedra Bonita se vê o mar!',
        answer_lat: -22.9068,
        answer_lng: -43.1729
    },
    {
        id: 7,
        question_text: 'Qual cidade tem o maior carnaval fora de época do Brasil e todo mundo vira "axé music"?',
        category: 'Festa',
        hint: 'Terra da música baiana e do acarajé!',
        answer_lat: -12.9714,
        answer_lng: -38.5014
    },
    {
        id: 8,
        question_text: 'Em qual cidade você pode almoçar no Brasil e jantar no Uruguai no mesmo dia?',
        category: 'Fronteira',
        hint: 'Cidade gêmea onde se fala "portunhol"!',
        answer_lat: -32.0346,
        answer_lng: -52.0985
    },
    {
        id: 9,
        question_text: 'Qual cidade é conhecida como a "Suíça brasileira" mas tem mais montanha-russa que neve?',
        category: 'Turismo',
        hint: 'No inverno fica cheio de paulista tentando ver neve!',
        answer_lat: -22.7386,
        answer_lng: -45.5908
    },
    {
        id: 10,
        question_text: 'Em que cidade você pode tomar banho de rio e ainda ver um encontro das águas que parece mágica?',
        category: 'Natureza',
        hint: 'Portal da Amazônia, onde rios se abraçam!',
        answer_lat: -3.1190,
        answer_lng: -60.0217
    }
];

let usedQuestions = [];

// Inicializar Google Maps
function initMap() {
    console.log('%c[MapChat] Inicializando mapa', 'color: blue;');
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: -14.2350, lng: -51.9253 }, // Centro do Brasil
        mapTypeId: 'terrain'
    });

    // Adicionar listener para cliques no mapa
    map.addListener('click', function(e) {
        makeGuess(e.latLng.lat(), e.latLng.lng());
    });

    // Carregar primeira pergunta
    loadNewQuestion();
}

// Carregar nova pergunta (com fallback)
async function loadNewQuestion() {
    console.log('%c[MapChat] Carregando nova pergunta...', 'color: orange;');
    
    try {
        // Tentar API primeiro
        const response = await fetch('/api/question/random', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentQuestion = data;
            gameMode = 'api';
            console.log('%c[MapChat] Pergunta carregada via API', 'color: green;');
        } else {
            throw new Error(`API retornou erro: ${response.status}`);
        }
    } catch (error) {
        console.warn('%c[MapChat] API falhou, usando modo offline', 'color: orange;', error);
        // Fallback para modo offline
        loadOfflineQuestion();
    }

    if (currentQuestion) {
        updateQuestionDisplay();
        resetAttempts();
        resetTimer();
        clearMap();
    }
}

// Carregar pergunta offline
function loadOfflineQuestion() {
    // Resetar perguntas usadas se todas foram utilizadas
    if (usedQuestions.length >= offlineQuestions.length) {
        usedQuestions = [];
    }

    // Filtrar perguntas não utilizadas
    const availableQuestions = offlineQuestions.filter(q => !usedQuestions.includes(q.id));
    
    // Selecionar pergunta aleatória
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIndex];
    usedQuestions.push(currentQuestion.id);
    
    gameMode = 'offline';
    console.log('%c[MapChat] Pergunta carregada offline', 'color: green;', currentQuestion);
}

// Atualizar display da pergunta
function updateQuestionDisplay() {
    if (!currentQuestion) return;
    
    document.getElementById('question-text').textContent = currentQuestion.question_text;
    document.getElementById('category').textContent = currentQuestion.category || 'Geografia';
    
    // Mostrar indicador do modo
    const modeIndicator = gameMode === 'api' ? '🌐 Online' : '📱 Offline';
    const modeElement = document.getElementById('game-mode');
    if (modeElement) {
        modeElement.textContent = modeIndicator;
    } else {
        // Criar elemento se não existir
        const newModeElement = document.createElement('div');
        newModeElement.id = 'game-mode';
        newModeElement.className = 'text-xs text-gray-500 mt-2';
        newModeElement.textContent = modeIndicator;
        document.getElementById('question-container').appendChild(newModeElement);
    }
}

// Fazer palpite
async function makeGuess(lat, lng) {
    if (!currentQuestion) return;

    attempts++;
    updateAttemptsDisplay();

    let result;
    
    if (gameMode === 'api') {
        try {
            result = await makeApiGuess(lat, lng);
        } catch (error) {
            console.warn('%c[MapChat] API guess falhou, calculando offline', 'color: orange;', error);
            result = makeOfflineGuess(lat, lng);
        }
    } else {
        result = makeOfflineGuess(lat, lng);
    }

    processGuessResult(result, lat, lng);
}

// Fazer palpite via API
async function makeApiGuess(lat, lng) {
    const response = await fetch('/api/question/guess', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({
            question_id: currentQuestion.id,
            lat: lat,
            lng: lng
        })
    });

    if (!response.ok) {
        throw new Error(`API erro: ${response.status}`);
    }

    return await response.json();
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
            text: `Você acertou! Distância: ${result.distance}km em ${attempts} tentativa(s)`,
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
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title,
        icon: {
            url: isCorrect ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });
}

function clearMap() {
    // Limpar todos os marcadores (se houver uma lista)
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
        window.markers = [];
    }
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
    // Resetar timer na navegação
    const timerElement = document.getElementById('timer');
    if (timerElement && typeof startTimer === 'function') {
        startTimer();
    }
}

function hideTimer() {
    // Parar timer na navegação
    if (typeof stopTimer === 'function') {
        stopTimer();
    }
}

function zoomIn() {
    if (map) map.setZoom(map.getZoom() + 1);
}

function zoomOut() {
    if (map) map.setZoom(map.getZoom() - 1);
}

// Inicializar quando a página carregar
window.onload = function() {
    console.log('%c[MapChat] Página carregada, aguardando Google Maps...', 'color: blue;');
};

// Função global para Google Maps callback
window.initMap = initMap;
