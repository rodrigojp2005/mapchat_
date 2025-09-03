@extends('layouts.app')
@section('content')
<div id="form_container" style="max-width: 600px; margin: 24px auto 0 auto; padding: 28px 24px 22px 24px; background: #eafaf1; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
    <h2 style="margin-bottom: 22px; text-align: center; font-weight: 700; color: #198754; font-size: 2rem; letter-spacing: 0.5px;">Criar Quiz / Pergunta</h2>
    <form id="form-criar-quiz" method="POST" action="{{ route('quiz.store') }}">
        @csrf
        <!-- Pergunta -->
        <div style="margin-bottom: 16px;">
            <label for="pergunta" style="display: block; font-weight: bold; margin-bottom: 6px;">Pergunta</label>
            <input type="text" id="pergunta" name="pergunta" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" placeholder="Ex: Onde está o Cristo Redentor?">
        </div>
        <!-- Mapa -->
        <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: bold; margin-bottom: 6px;">Escolha o local da resposta</label>
            <div id="map-quiz" style="height: 300px; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>
            <input type="hidden" id="latitude" name="latitude">
            <input type="hidden" id="longitude" name="longitude">
        </div>
        <!-- Cidade/Endereço -->
        <div style="margin-bottom: 16px;">
            <label for="cidade" style="display: block; font-weight: bold; margin-bottom: 6px;">Cidade / Endereço</label>
            <input type="text" id="cidade" name="cidade" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" placeholder="Digite uma cidade ou endereço" oninput="debouncedBuscarCidade()">
            <small id="cidade-feedback" style="color: #6c757d; font-size: 12px;"></small>
        </div>
        <!-- Dica -->
        <div style="margin-bottom: 16px;">
            <label for="dica" style="display: block; font-weight: bold; margin-bottom: 6px;">Dica</label>
            <textarea id="dica" name="dica" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; min-height: 80px;" placeholder="Dê uma dica sobre o local..."></textarea>
        </div>
        <!-- Botões -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 18px;">
            <button type="submit" style="padding: 10px 28px; background-color: #198754; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1.08em;">
                Salvar Pergunta
            </button>
            <a href="/" style="padding: 10px 28px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600; font-size: 1.08em;">
                Cancelar
            </a>
        </div>
    </form>
</div>
<script>
    let map, marker, geocoder;
    function initMap() {
        const defaultLocation = { lat: -23.55052, lng: -46.633308 };
        map = new google.maps.Map(document.getElementById('map-quiz'), {
            center: defaultLocation,
            zoom: 12
        });
        geocoder = new google.maps.Geocoder();
        marker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            draggable: true
        });
        function updateLatLngFields(position) {
            document.getElementById('latitude').value = position.lat();
            document.getElementById('longitude').value = position.lng();
        }
        updateLatLngFields(marker.getPosition());
        marker.addListener('dragend', function() {
            updateLatLngFields(marker.getPosition());
        });
        map.addListener('click', function(event) {
            marker.setPosition(event.latLng);
            updateLatLngFields(event.latLng);
        });
    }
    let buscarCidadeTimeout;
    function debouncedBuscarCidade() {
        clearTimeout(buscarCidadeTimeout);
        buscarCidadeTimeout = setTimeout(buscarCidade, 500);
    }
    function buscarCidade() {
        const endereco = document.getElementById('cidade').value;
        const feedback = document.getElementById('cidade-feedback');
        if (!endereco) {
            feedback.textContent = '';
            return;
        }
        geocoder.geocode({ address: endereco }, function (results, status) {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                map.panTo(location);
                map.setZoom(16);
                marker.setPosition(location);
                document.getElementById('latitude').value = location.lat();
                document.getElementById('longitude').value = location.lng();
                feedback.textContent = 'Endereço encontrado: ' + results[0].formatted_address;
                feedback.style.color = '#198754';
            } else {
                feedback.textContent = 'Local não encontrado.';
                feedback.style.color = '#dc3545';
            }
        });
    }
</script>
<script async defer src="https://maps.googleapis.com/maps/api/js?key={{ env('GOOGLE_MAPS_API_KEY') }}&callback=initMap&libraries=geometry"></script>
@endsection
