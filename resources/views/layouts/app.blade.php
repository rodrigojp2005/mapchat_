<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('styles')
    </head>
    <body class="font-sans antialiased">
        <!-- Navigation Bar -->
        <nav class="w-full bg-white flex items-center justify-between px-6 md:px-12 h-14 shadow fixed top-0 left-0 z-50">
            <div class="flex items-center">
                <img src="https://img.icons8.com/ios-filled/50/000000/chat.png" alt="Logo" class="h-8 mr-3">
                <span class="font-bold text-lg text-blue-600 tracking-wide">mapchat</span>
            </div>
            <div class="hidden md:flex items-center space-x-6 pr-2" id="navbarRight">
                <div id="timerContainer" class="flex items-center bg-red-50 rounded-lg px-3 py-1 border border-red-200 hidden">
                    <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDE0OWw4Y3BndHh5Zmpwam12djc5MGRtb3ZocXJqeng0ZThoemE3eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/jV0fRmUyDAGRalG0T7/giphy.gif" alt="Timer" class="w-5 h-5 mr-2">
                    <span id="timer" class="font-mono font-bold text-red-600 text-lg pulse-timer">30</span>
                </div>
                <a href="#sobre" class="text-gray-700 font-medium hover:text-blue-600">Sobre</a>
                <a href="#como-jogar" class="text-gray-700 font-medium hover:text-blue-600">Como jogar</a>
                @auth
                    <a href="{{ route('dashboard') }}" class="bg-blue-600 text-white rounded px-4 py-1 font-semibold ml-2 hover:bg-blue-700 transition">Dashboard</a>
                    <form method="POST" action="{{ route('logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="ml-2 bg-gray-200 text-gray-700 rounded px-3 py-1 font-semibold hover:bg-gray-300 transition">Sair</button>
                    </form>
                @else
                    <a href="/login" class="bg-blue-600 text-white rounded px-4 py-1 font-semibold ml-2 hover:bg-blue-700 transition">Entrar</a>
                @endauth
            </div>
            <div class="md:hidden flex items-center">
                <div id="timerContainerMobile" class="flex items-center bg-red-50 rounded-lg px-2 py-1 border border-red-200 mr-2 hidden">
                    <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDE0OWw4Y3BndHh5Zmpwam12djc5MGRtb3ZocXJqeng0ZThoemE3eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/jV0fRmUyDAGRalG0T7/giphy.gif" alt="Timer" class="w-4 h-4 mr-1">
                    <span id="timerMobile" class="font-mono font-bold text-red-600 text-sm pulse-timer">30</span>
                </div>
                <button id="navbarMenu" onclick="toggleMenu()" class="focus:outline-none p-2 rounded hover:bg-gray-100">
                    <svg class="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>
            <div class="absolute right-2 top-14 w-48 bg-white rounded shadow-lg flex-col items-end py-2 space-y-1 z-50 hidden" id="mobileMenu">
                <a href="#sobre" class="block px-4 py-2 text-gray-700 hover:text-blue-600">Sobre</a>
                <a href="#como-jogar" class="block px-4 py-2 text-gray-700 hover:text-blue-600">Como jogar</a>
                @auth
                    <a href="{{ route('dashboard') }}" class="block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Dashboard</a>
                    <form method="POST" action="{{ route('logout') }}" class="block px-4 py-2">
                        @csrf
                        <button type="submit" class="w-full text-left text-gray-700">Sair</button>
                    </form>
                @else
                    <a href="/login" class="block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Entrar</a>
                @endauth
            </div>
        </nav>

        <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
            <main>
                @yield('content')
            </main>
        </div>

        <!-- Footer -->
        <footer class="w-full bg-white text-gray-700 text-center py-3 text-base fixed left-0 bottom-0 z-40 shadow">
            mapchat 2025 @ vc sabe onde está? direitos reservados. 
        </footer>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const menu = document.getElementById('mobileMenu');
                const btn = document.getElementById('navbarMenu');
                // Toggle menu ao clicar no botão
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    menu.classList.toggle('hidden');
                });
                // Fecha ao clicar fora
                document.addEventListener('click', function(e) {
                    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                        menu.classList.add('hidden');
                    }
                });
                // Fecha ao clicar em qualquer link/botão do menu
                menu.querySelectorAll('a,button').forEach(el => {
                    el.addEventListener('click', function() {
                        menu.classList.add('hidden');
                    });
                });
            });
        </script>
        
        <!-- JavaScript do Timer -->
        <script>
            let timerInterval;
            let currentTime = 30; // 30 segundos por pergunta
            let timerRunning = false; // Flag para evitar múltiplos timers
            
            function startTimer() {
                // Parar timer existente antes de iniciar novo
                if (timerRunning) {
                    clearInterval(timerInterval);
                }
                
                console.log('%c[Timer] ⏰ Iniciando cronômetro', 'color: red; font-weight: bold;');
                currentTime = 30;
                timerRunning = true;
                showTimer();
                updateTimerDisplay();
                
                timerInterval = setInterval(() => {
                    currentTime--;
                    updateTimerDisplay();
                    
                    if (currentTime <= 0) {
                        stopTimer();
                        // Evento quando tempo acaba (será tratado no welcome.js)
                        if (typeof onTimerEnd === 'function') {
                            onTimerEnd();
                        }
                    }
                }, 1000);
            }
            
            function stopTimer() {
                if (!timerRunning) return; // Evitar parar timer já parado
                
                console.log('%c[Timer] ⏹️ Parando cronômetro', 'color: red; font-weight: bold;');
                clearInterval(timerInterval);
                timerRunning = false;
                hideTimer();
            }
            
            function showTimer() {
                document.getElementById('timerContainer').classList.remove('hidden');
                document.getElementById('timerContainerMobile').classList.remove('hidden');
            }
            
            function hideTimer() {
                document.getElementById('timerContainer').classList.add('hidden');
                document.getElementById('timerContainerMobile').classList.add('hidden');
            }
            
            function updateTimerDisplay() {
                document.getElementById('timer').textContent = currentTime;
                document.getElementById('timerMobile').textContent = currentTime;
                
                // Muda cor quando restam poucos segundos
                if (currentTime <= 10) {
                    document.getElementById('timer').classList.add('text-red-800');
                    document.getElementById('timerMobile').classList.add('text-red-800');
                } else {
                    document.getElementById('timer').classList.remove('text-red-800');
                    document.getElementById('timerMobile').classList.remove('text-red-800');
                }
            }
        </script>
        
        <style>
            .pulse-timer {
                animation: pulse 1s infinite;
                font-size: 1.2em;
                font-weight: bold;
                color: #dc2626; /* red-600 */
                text-shadow: 0 0 5px rgba(220, 38, 38, 0.5);
            }
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.8;
                }
            }
        </style>
        @stack('scripts')
    </body>
</html>
