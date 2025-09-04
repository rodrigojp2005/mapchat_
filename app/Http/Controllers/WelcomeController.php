<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Quiz;

class WelcomeController extends Controller
{
    public function index()
    {
        // Busca todas perguntas e quizzes
        $questions = Question::all();
    $quizzes = Quiz::with('user')->get();
        // Normaliza quizzes para o mesmo formato das perguntas
        $quizQuestions = $quizzes->map(function($quiz) {
            return [
                'id' => $quiz->id,
                'question_text' => $quiz->pergunta,
                'category' => $quiz->cidade ?? null,
                'hint' => $quiz->dica,
                'answer_lat' => (float) $quiz->latitude,
                'answer_lng' => (float) $quiz->longitude,
                'user_id' => $quiz->user_id,
        'user_name' => optional($quiz->user)->name ?? 'anônimo',
            ];
        });
    $allQuestions = $questions->map(function($q) {
            return [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'category' => $q->category,
                'hint' => $q->hint,
                'answer_lat' => (float) $q->answer_lat,
                'answer_lng' => (float) $q->answer_lng,
                'user_id' => $q->user_id,
        'user_name' => optional($q->user)->name ?? 'anônimo',
            ];
        })->concat($quizQuestions)->values();
        return view('welcome', ['questions' => $allQuestions]);
    }
}
