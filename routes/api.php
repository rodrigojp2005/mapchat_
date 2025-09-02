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
    // Extra closing brace removed
Route::get('/question/random', [QuestionController::class, 'random']);
Route::post('/question/guess', [QuestionController::class, 'guess']);
