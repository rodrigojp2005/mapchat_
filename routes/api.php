<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\Api\QuestionController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rota de teste
Route::get('/test', function () {
    return response()->json(['status' => 'API funcionando!', 'time' => now()]);
});

// Rota de diagnóstico completo
Route::get('/debug', function () {
    try {
        $questionCount = \App\Models\Question::count();
        $userCount = \App\Models\User::count();
        $firstQuestion = \App\Models\Question::first();
        
        return response()->json([
            'status' => 'DEBUG OK',
            'database' => [
                'questions_count' => $questionCount,
                'users_count' => $userCount,
                'first_question' => $firstQuestion ? [
                    'id' => $firstQuestion->id,
                    'text' => substr($firstQuestion->question_text, 0, 50) . '...',
                ] : null
            ],
            'server' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => config('app.env'),
                'debug' => config('app.debug'),
                'database_default' => config('database.default'),
            ],
            'timestamp' => now()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'ERROR',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// Rotas das perguntas
Route::get('/question/random', [QuestionController::class, 'random']);
Route::post('/question/guess', [QuestionController::class, 'guess']);
