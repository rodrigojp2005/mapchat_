let map;
let currentQuestion = null;
// Perguntas mockadas para teste local sem API
console.log('%c[MapChat] JS carregado em', 'color: green; font-weight: bold;', new Date().toLocaleString());
const mockQuestions = [
    // Exemplo de mock apenas para desenvolvimento local.
    // No ambiente real, os campos user_id e user_name devem vir do backend/API.
    {
        id: 1,
        question_text: 'Onde fica o Cristo Redentor?',
        category: 'Ponto turístico',
        hint: 'Fica no Rio de Janeiro',
        answer_lat: -22.9519,
        answer_lng: -43.2105
    },
    {
        id: 2,
        question_text: 'Onde está a Praça dos Três Poderes?',
        category: 'Praça',
        hint: 'Fica na capital do Brasil',
        answer_lat: -15.7997,
        answer_lng: -47.8645
    },
    {
        id: 3,
        question_text: 'Em que cidade está o Mercado Ver-o-Peso?',
        category: 'Mercado',
        hint: 'Fica no Norte do Brasil',
        answer_lat: -1.4521,
        answer_lng: -48.5044
    }
];
let mockIndex = 0;
let timerInterval = null;
let timeLeft = 30;
let attempts = 0;
let maxAttempts = 5;
let marker = null;

function hideTimer() {
    const timerContainer = document.getElementById('timerContainer');
    const timerContainerMobile = document.getElementById('timerContainerMobile');
    if (timerContainer) timerContainer.classList.add('hidden');
    if (timerContainerMobile) timerContainerMobile.classList.add('hidden');
}

function updateAttemptsDisplay() {
    const attemptsDisplay = document.getElementById('attemptsDisplay');
    const remaining = maxAttempts - attempts;
    if (attemptsDisplay) {
        if (remaining > 0) {
            attemptsDisplay.innerHTML = `🎯 ${remaining} tentativa${remaining > 1 ? 's' : ''}`;
            attemptsDisplay.className = remaining > 2 ? 'font-mono font-bold text-orange-600' : 'font-mono font-bold text-red-600';
        } else {
            attemptsDisplay.innerHTML = '❌ Sem tentativas';
            attemptsDisplay.className = 'font-mono font-bold text-red-600';
        }
    }
}

function initMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
        console.error('Elemento #map não encontrado!');
        return;
    }
    map = new google.maps.Map(mapDiv, {
        center: { lat: -14.2350, lng: -51.9253 }, // Centro do Brasil
        zoom: 4,
        disableDefaultUI: true,
        gestureHandling: 'greedy', // Permite arrastar com um dedo no mobile
    });
    fetchQuestion();
    map.addListener('click', onMapClick);
    // Controles de zoom agora são botões fixos, não precisam de toggle JS
}

function fetchQuestion() {
    fetch('/api/question/random')
        .then(res => res.json())
        .then(data => {
            console.log('%c[MapChat] JSON da API:', 'color: orange; font-weight: bold;', data);
            currentQuestion = data;
            console.log('ID do usuário criador:', currentQuestion.user_id);
            document.getElementById('questionText').innerText = currentQuestion.question_text;
            document.getElementById('hint').style.display = 'block';
            document.getElementById('hint').innerHTML = `<b>Pergunta criada:</b> ${currentQuestion.user_name ? currentQuestion.user_name : 'anônimo'}`;
            attempts = 0;
            updateAttemptsDisplay();
            resetTimer();
            removerBotaoProximaPergunta();
        })
        .catch(err => {
            console.error('Erro ao buscar questão da API:', err);
            document.getElementById('questionText').innerText = 'Erro ao carregar pergunta.';
        });
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    
    // Mostrar o timer na navegação
    const timerContainer = document.getElementById('timerContainer');
    const timerContainerMobile = document.getElementById('timerContainerMobile');
    const timer = document.getElementById('timer');
    const timerMobile = document.getElementById('timerMobile');
    
    if (timerContainer) timerContainer.classList.remove('hidden');
    if (timerContainerMobile) timerContainerMobile.classList.remove('hidden');
    if (timer) timer.innerText = timeLeft;
    if (timerMobile) timerMobile.innerText = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timer) timer.innerText = timeLeft;
        if (timerMobile) timerMobile.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('questionText').innerText = 'Tempo esgotado!';
            mostrarBotaoProximaPergunta();
        }
    }, 1000);
}


function onMapClick(event) {
    if (!currentQuestion || timeLeft <= 0 || attempts >= maxAttempts) return;
    attempts++;
    updateAttemptsDisplay();
    placeMarker(event.latLng);
    enviarPalpite(event.latLng.lat(), event.latLng.lng());
}


function enviarPalpite(lat, lng) {
    // Validação no frontend
    const answerLat = currentQuestion.answer_lat;
    const answerLng = currentQuestion.answer_lng;
    console.log('Palpite recebido:', { lat, lng });
    console.log('Resposta correta:', { answerLat, answerLng });
    const distance = haversine(lat, lng, answerLat, answerLng);
    const isCorrect = distance < 10; // 10km de tolerância
    const direction = getDirection(lat, lng, answerLat, answerLng);
    console.log('Distância calculada:', distance.toFixed(2), 'km');
    console.log('Direção:', direction);

    let title, html, imageUrl = '';
    if (isCorrect) {
        title = '🎉 Parabéns! Você acertou!';
        html = `<div style='font-size:1.1em;'>Você acertou a localização!<br><b>Distância:</b> ${distance.toFixed(2)} km<br><b>Direção:</b> ${direction}</div>`;
        imageUrl = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHRrN3c5aWwxNnI5eWhua2k2OW4za3ZxMG9neDQwY2NpODNqdjFpMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qHaKRvrEA00Hm/giphy.gif';
        clearInterval(timerInterval);
        // Esconder o timer
        hideTimer();
        mostrarBotaoProximaPergunta();
        console.log('Resultado: ACERTOU');
    } else {
        title = 'Tente novamente!';
        const tentativasRestantes = maxAttempts - attempts;
        let tentativasText = '';
        
        if (tentativasRestantes > 0) {
            tentativasText = `<br><span style="color: #f59e0b; font-weight: bold;">🎯 Você ainda tem ${tentativasRestantes} tentativa${tentativasRestantes > 1 ? 's' : ''}!</span>`;
        } else {
            tentativasText = '<br><span style="color: #dc2626; font-weight: bold;">❌ Limite de tentativas atingido!</span>';
        }
        
        html = `<div style='font-size:1.1em;'>Errou!<br><b>Distância:</b> ${distance.toFixed(2)} km<br><b>Direção:</b> ${direction}${tentativasText}</div>`;
        imageUrl = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmtrYnB0bTNyYm03eDZ3bmhlc3dxZWJncXh3a24zOTlkNWJqbnc3OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SB0NySeYf268N2Nhv7/giphy.gif';
        if (attempts >= maxAttempts) {
            clearInterval(timerInterval);
            // Esconder o timer
            hideTimer();
            mostrarBotaoProximaPergunta();
        }
        console.log('Resultado: ERROU');
    }
    if (typeof Swal !== 'undefined' && typeof Swal.fire === 'function') {
        Swal.fire({
            title: title,
            html: html,
            imageUrl: imageUrl,
            imageHeight: 180,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded-lg',
                confirmButton: 'bg-blue-600 text-white px-6 py-2 rounded font-bold',
            },
        });
    } else {
        alert(title + '\n' + html.replace(/<[^>]+>/g, ''));
    }
}

// Fórmula de Haversine para calcular distância entre dois pontos
function haversine(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthRadius * c;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Retorna direção cardinal aproximada
function getDirection(lat1, lon1, lat2, lon2) {
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const angle = Math.atan2(dLon, dLat) * 180 / Math.PI;
    const directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
    const index = Math.round(((angle + 360) % 360) / 45) % 8;
    return directions[index];
}


function mostrarBotaoProximaPergunta() {
    let balloon = document.getElementById('questionBalloon');
    if (!document.getElementById('btnProximaPergunta')) {
        let btn = document.createElement('button');
        btn.id = 'btnProximaPergunta';
        btn.innerText = 'Próxima pergunta';
        btn.className = 'mt-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition';
        btn.onclick = function() {
            btn.remove();
            fetchQuestion();
        };
        balloon.appendChild(btn);
    }
}

function removerBotaoProximaPergunta() {
    let btn = document.getElementById('btnProximaPergunta');
    if (btn) btn.remove();
}

function updateAttemptsDisplay() {
    let attemptsSpan = document.getElementById('attemptsDisplay');
    if (attemptsSpan) {
        // Só limpa a contagem se for a última pergunta do ciclo
        if (attempts >= maxAttempts && mockIndex === 0) {
            attemptsSpan.innerText = '';
        } else {
            attemptsSpan.innerText = `${attempts + 1}/${maxAttempts}`;
        }
    }
}

function placeMarker(location) {
    if (marker) marker.setMap(null);
    marker = new google.maps.Marker({
        position: location,
        map: map,
    });
}

function zoomIn() {
    if (map) map.setZoom(map.getZoom() + 1);
}
function zoomOut() {
    if (map) map.setZoom(map.getZoom() - 1);
}

function toggleMenu() {
    const nav = document.getElementById('navbarRight');
    nav.classList.toggle('active');
}
