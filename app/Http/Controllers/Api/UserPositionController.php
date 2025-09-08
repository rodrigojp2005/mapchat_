<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Routing\Controller;

class UserPositionController extends Controller
{
    // Salva/atualiza posição pseudo real do usuário
    public function store(Request $request)
    {
        $id = $request->input('id'); // pode ser session id, user id, ou um hash
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        if (!$id || !$lat || !$lng) {
            return response()->json(['error' => 'Dados incompletos'], 400);
        }
        // Salva no cache por 2 minutos
        $locations = Cache::get('user_positions', []);
        $locations[$id] = [
            'lat' => $lat,
            'lng' => $lng,
            'updated_at' => now()->timestamp
        ];
        Cache::put('user_positions', $locations, 120);
        return response()->json(['success' => true]);
    }

    // Retorna todas as posições pseudo reais dos usuários
    public function index()
    {
        $locations = Cache::get('user_positions', []);
        $now = now()->timestamp;
        $filtered = [];
        foreach ($locations as $id => $loc) {
            if ($now - $loc['updated_at'] < 120) {
                $filtered[$id] = $loc;
            }
        }
        return response()->json(array_values($filtered));
    }
}
