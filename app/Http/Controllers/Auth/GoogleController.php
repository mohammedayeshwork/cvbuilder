<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

class GoogleController extends Controller
{
    public function redirect(): SymfonyRedirect
    {
        abort_unless(filled(config('services.google.client_id')), 404);

        return Socialite::driver('google')->redirect();
    }

    /**
     * Sign in the Google account's user: by Google id, else by verified email
     * (linking the accounts), else as a new user without a password.
     */
    public function callback(): RedirectResponse
    {
        abort_unless(filled(config('services.google.client_id')), 404);

        try {
            /** @var GoogleUser $google */
            $google = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            report($e);

            return to_route('login')->withErrors(['email' => __('Google sign-in failed. Please try again.')]);
        }

        if (! ($google->user['email_verified'] ?? false) || blank($google->getEmail())) {
            return to_route('login')->withErrors(['email' => __('Your Google account has no verified email address.')]);
        }

        $user = User::query()->where('google_id', $google->getId())->first()
            ?? User::query()->where('email', $google->getEmail())->first();

        if ($user === null) {
            $user = User::forceCreate([
                'name' => $google->getName() ?: $google->getEmail(),
                'email' => $google->getEmail(),
                'email_verified_at' => now(),
                'google_id' => $google->getId(),
                'avatar' => $google->getAvatar(),
            ]);
        } elseif ($user->google_id === null) {
            $this->link($user, $google);
        }

        Auth::login($user, remember: true);
        session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Attach Google to an existing account. If its email was never verified,
     * whoever registered it may not own the address, so drop their password
     * and sessions; the Google user can set a new password later.
     */
    private function link(User $user, GoogleUser $google): void
    {
        $unverified = $user->email_verified_at === null;

        $user->forceFill([
            'google_id' => $google->getId(),
            'avatar' => $user->avatar ?? $google->getAvatar(),
            'email_verified_at' => $user->email_verified_at ?? now(),
            ...($unverified ? ['password' => null, 'remember_token' => null] : []),
        ])->save();

        if ($unverified && config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }
    }
}
