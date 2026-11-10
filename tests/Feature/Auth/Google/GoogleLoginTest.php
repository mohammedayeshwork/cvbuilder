<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;

function fakeGoogleUser(array $overrides = []): void
{
    $data = [
        'id' => 'g-123',
        'name' => 'Grace Hopper',
        'email' => 'grace@example.com',
        'avatar' => 'https://lh3.example.com/a.png',
        'email_verified' => true,
        ...$overrides,
    ];

    $user = (new GoogleUser)->setRaw($data)->map([
        'id' => $data['id'],
        'name' => $data['name'],
        'email' => $data['email'],
        'avatar' => $data['avatar'],
    ]);

    Socialite::shouldReceive('driver->user')->andReturn($user);
}

beforeEach(fn () => config(['services.google.client_id' => 'test-client', 'services.google.client_secret' => 'secret']));

it('is hidden when Google is not configured', function () {
    config(['services.google.client_id' => null]);

    $this->get(route('google.redirect'))->assertNotFound();
});

it('redirects to Google', function () {
    $this->get(route('google.redirect'))->assertRedirectContains('accounts.google.com');
});

it('creates a verified, passwordless user on first sign-in', function () {
    fakeGoogleUser();

    $this->get(route('google.callback'))->assertRedirect(route('dashboard', absolute: false));

    $user = User::sole();
    expect($user)
        ->google_id->toBe('g-123')
        ->email->toBe('grace@example.com')
        ->password->toBeNull()
        ->email_verified_at->not->toBeNull()
        ->has_password->toBeFalse();
    $this->assertAuthenticatedAs($user);
});

it('links an existing verified account by email and keeps its password', function () {
    $existing = User::factory()->create(['email' => 'grace@example.com']);
    $hash = $existing->password;
    fakeGoogleUser();

    $this->get(route('google.callback'));

    expect($existing->fresh())
        ->google_id->toBe('g-123')
        ->password->toBe($hash);
    $this->assertAuthenticatedAs($existing);
});

it('drops the password of an unverified account it takes over', function () {
    $squatter = User::factory()->unverified()->create(['email' => 'grace@example.com']);
    fakeGoogleUser();

    $this->get(route('google.callback'));

    expect($squatter->fresh())
        ->password->toBeNull()
        ->email_verified_at->not->toBeNull();
});

it('refuses Google accounts without a verified email', function () {
    fakeGoogleUser(['email_verified' => false]);

    $this->get(route('google.callback'))->assertRedirect(route('login'))->assertSessionHasErrors('email');

    expect(User::count())->toBe(0);
    $this->assertGuest();
});

it('lets passwordless users set a password and delete their account without one', function () {
    $user = User::factory()->create(['password' => null]);

    $this->actingAs($user)
        ->put(route('user-password.update'), ['password' => 'new-Password-123', 'password_confirmation' => 'new-Password-123'])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->has_password)->toBeTrue();

    $other = User::factory()->create(['password' => null]);
    $this->actingAs($other)->delete(route('profile.destroy'))->assertSessionHasNoErrors();

    expect($other->fresh())->toBeNull();
});

it('cannot log in with a password to a passwordless account', function () {
    User::factory()->create(['email' => 'grace@example.com', 'password' => null]);

    $this->post(route('login.store'), ['email' => 'grace@example.com', 'password' => ''])->assertSessionHasErrors();
    $this->post(route('login.store'), ['email' => 'grace@example.com', 'password' => 'anything'])->assertSessionHasErrors();

    $this->assertGuest();
});
