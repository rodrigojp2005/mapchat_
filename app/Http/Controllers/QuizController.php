<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;

class QuizController extends Controller
{
    public function create()
    {
        return view('quiz.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'pergunta' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'cidade' => 'nullable|string|max:255',
            'dica' => 'nullable|string|max:255',
        ]);

        $quiz = Quiz::create([
            'pergunta' => $request->pergunta,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'cidade' => $request->cidade,
            'dica' => $request->dica,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Pergunta criada com sucesso!');
    }
}
