<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    // Retorna uma pergunta aleatória
    public function random()
    {
        // Log detalhado para debug
        \Log::info('[MapChat API] Iniciando busca por pergunta aleatória');
        
        try {
            // Verificar conexão com banco
            $questionCount = Question::count();
            \Log::info("[MapChat API] Total de perguntas no banco: {$questionCount}");
            
            if ($questionCount == 0) {
                \Log::warning('[MapChat API] Nenhuma pergunta encontrada no banco');
                return response()->json([
                    'error' => 'Nenhuma pergunta disponível no banco de dados.',
                    'debug' => [
                        'question_count' => $questionCount,
                        'timestamp' => now()
                    ]
                ], 404);
            }
            
            $question = Question::inRandomOrder()->first();
            \Log::info("[MapChat API] Pergunta selecionada: ID {$question->id}");
            
            if (!$question) {
                \Log::error('[MapChat API] Erro: pergunta é null após busca');
                return response()->json([
                    'error' => 'Erro interno: pergunta não encontrada.',
                    'debug' => [
                        'question_count' => $questionCount,
                        'timestamp' => now()
                    ]
                ], 404);
            }

            $response = [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'category' => $question->category,
                'hint' => $question->hint,
                'answer_lat' => (float) $question->answer_lat,
                'answer_lng' => (float) $question->answer_lng,
                'user_id' => $question->user_id,
                'user_name' => $question->user ? $question->user->name : 'anônimo',
                'debug' => [
                    'mode' => 'api',
                    'timestamp' => now(),
                    'server_info' => [
                        'php_version' => PHP_VERSION,
                        'laravel_version' => app()->version()
                    ]
                ]
            ];
            
            \Log::info('[MapChat API] Resposta preparada com sucesso');
            
            return response()->json($response);
            
        } catch (\Exception $e) {
            \Log::error('[MapChat API] Erro ao buscar pergunta: ' . $e->getMessage());
            \Log::error('[MapChat API] Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Erro ao buscar pergunta: ' . $e->getMessage(),
                'debug' => [
                    'exception_class' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'timestamp' => now()
                ]
            ], 500);
        }
    }
    // Valida o palpite do usuário
    public function guess(Request $request)
    {
        try {
            $request->validate([
                'question_id' => 'required|exists:questions,id',
                'lat' => 'required|numeric',
                'lng' => 'required|numeric',
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
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao processar palpite: ' . $e->getMessage()], 500);
        }
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
