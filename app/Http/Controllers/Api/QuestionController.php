<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    // Retorna uma pergunta aleatória
    public function random()
    {
        $question = \DB::table('questions')->inRandomOrder()->first();
        if (!$question) {
            return response()->json(['error' => 'Nenhuma pergunta disponível.'], 404);
        }
        $user = \DB::table('users')->where('id', $question->user_id)->first();
        return response()->json([
            'id' => $question->id,
            'question_text' => $question->question_text,
            'category' => $question->category,
            'hint' => $question->hint,
            'answer_lat' => $question->answer_lat,
            'answer_lng' => $question->answer_lng,
            'user_id' => $question->user_id,
            'user_name' => $user ? $user->name : 'anônimo',
        ]);
    }
    // Valida o palpite do usuário
    public function guess(Request $request)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'user_id' => 'required|exists:users,id',
        ]);

        $question = Question::findOrFail($request->question_id);
        $distance = $this->haversine($request->lat, $request->lng, $question->answer_lat, $question->answer_lng);
        $isCorrect = $distance < 10; // 10km de tolerância para acerto

        // Calcula direção
        $direction = $this->getDirection($request->lat, $request->lng, $question->answer_lat, $question->answer_lng);



        return response()->json([
            'correct' => $isCorrect,
            'distance' => round($distance, 2),
            'direction' => $direction,
            'hint' => $isCorrect ? null : $question->hint,
        ]);
    }

    // Haversine formula para calcular distância entre dois pontos
    private function haversine($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }

    // Retorna direção cardinal aproximada
    private function getDirection($lat1, $lon1, $lat2, $lon2)
    {
        $dLat = $lat2 - $lat1;
        $dLon = $lon2 - $lon1;
        $angle = atan2($dLon, $dLat) * 180 / pi();
        $directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
        $index = round((($angle + 360) % 360) / 45) % 8;
        return $directions[$index];
    }
}
