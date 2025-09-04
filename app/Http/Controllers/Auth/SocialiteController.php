<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class SocialiteController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrCreate([
                'email' => $googleUser->getEmail(),
            ], [
                'name' => $googleUser->getName() ?? $googleUser->getNickname(),
                'password' => bcrypt(uniqid()),
            ]);

            Auth::login($user, true);

            // Redireciona para criar quiz (dashboard removido)
            return redirect()->intended(route('quiz.create'));
        } catch (\Throwable $e) {
            \Log::error('[OAuth] Google callback error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('login')->with('error', 'Falha ao autenticar com Google.');
        }
    }
}
