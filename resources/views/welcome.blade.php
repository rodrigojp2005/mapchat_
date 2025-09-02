@extends('layouts.app')

@section('title', 'MapChat - Adivinhe Onde')

@section('content')
    <div class="relative w-full min-h-screen bg-gray-50 flex flex-col items-center" style="padding-top:56px; padding-bottom:48px;">
        <div class="absolute inset-0 top-14 bottom-12 w-full h-full z-10">
            <div id="map" class="w-full h-full"></div>
        </div>
        <div id="questionBalloon" class="absolute left-1/2 top-24 md:top-20 transform -translate-x-1/2 z-30 w-11/12 max-w-md bg-white rounded-xl shadow-xl border border-blue-200 p-4 flex flex-col gap-2">
            <div id="question-container">
                <div class="font-semibold text-lg text-blue-700 mb-1" id="question-text">Carregando pergunta...</div>
                <div class="text-sm text-gray-500 mb-2" id="category">Geografia</div>
            </div>
            <div class="flex justify-between text-sm text-gray-600 mt-1">
                <span id="attemptsDisplay" class="font-mono font-bold text-orange-600">
                    🎯 <span id="attempts-count">0</span>/<span id="max-attempts">5</span> tentativas
                </span>
                <span id="hint" class="ml-2 hidden text-blue-600"></span>
            </div>
        </div>
    <!-- Botões de zoom só aparecem em telas médias para cima -->
    <button onclick="zoomIn()" class="hidden md:fixed md:bottom-28 md:right-12 md:bg-blue-600 md:text-white md:w-10 md:h-10 md:rounded-full md:shadow-lg md:flex md:items-center md:justify-center md:text-2xl md:hover:bg-blue-700 md:z-40">+</button>
    <button onclick="zoomOut()" class="hidden md:fixed md:bottom-14 md:right-12 md:bg-blue-600 md:text-white md:w-10 md:h-10 md:rounded-full md:shadow-lg md:flex md:items-center md:justify-center md:text-2xl md:hover:bg-blue-700 md:z-40">-</button>
    </div>
@endsection

@push('scripts')
<!-- SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="/js/welcome-robust.js"></script>
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBzEzusC_k3oEoPnqynq2N4a0aA3arzH-c&callback=initMap"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        function showSobre() {
            Swal.fire({
                title: '<span class="text-blue-700">Sobre o MapChat</span>',
                html: '<p class="text-gray-700">O MapChat é um jogo de perguntas geolocalizadas para visitantes explorarem o mapa e testarem seus conhecimentos sobre diferentes lugares.</p>',
                confirmButtonText: 'Fechar',
                customClass: {popup: 'rounded-lg'}
            });
        }
        function showComoJogar() {
            Swal.fire({
                title: '<span class="text-blue-700">Como jogar</span>',
                html: `<ol class='list-decimal list-inside text-gray-700 space-y-1 text-left'>
                        <li>Explore o mapa e clique nos balões de perguntas.</li>
                        <li>Responda corretamente para ganhar pontos.</li>
                        <li>Você tem 3 tentativas e um tempo limitado para cada pergunta.</li>
                    </ol>`,
                confirmButtonText: 'Fechar',
                customClass: {popup: 'rounded-lg'}
            });
        }
        // Menu desktop
        document.querySelectorAll('a[href="#sobre"]').forEach(el => el.addEventListener('click', function(e){ e.preventDefault(); showSobre(); }));
        document.querySelectorAll('a[href="#como-jogar"]').forEach(el => el.addEventListener('click', function(e){ e.preventDefault(); showComoJogar(); }));
    });
</script>
@endpush
