<?php

use App\Documents\PrintToken;
use App\Models\Document;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    $this->document = Document::factory()->create();
    $this->signed = URL::temporarySignedRoute('documents.print', now()->addMinutes(2), ['document' => $this->document], absolute: false);
});

it('renders the print page with a valid signature and token', function () {
    $this->get($this->signed, [PrintToken::HEADER => PrintToken::for($this->document)])
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('documents/print')->where('document.id', $this->document->id))
        ->assertSee('noindex', false);
});

it('rejects a missing signature', function () {
    $this->get(route('documents.print', $this->document), [PrintToken::HEADER => PrintToken::for($this->document)])
        ->assertForbidden();
});

it('rejects a missing or wrong token', function (?string $token) {
    $this->get($this->signed, $token === null ? [] : [PrintToken::HEADER => $token])->assertForbidden();
})->with([null, 'not-the-token']);

it('rejects a tampered or expired signature', function () {
    $other = Document::factory()->create();
    $tampered = str_replace("/print/{$this->document->id}?", "/print/{$other->id}?", $this->signed);

    $this->get($tampered, [PrintToken::HEADER => PrintToken::for($other)])->assertForbidden();

    $this->travel(3)->minutes();
    $this->get($this->signed, [PrintToken::HEADER => PrintToken::for($this->document)])->assertForbidden();
});

it('gives every document its own token', function () {
    expect(PrintToken::for(Document::factory()->create()))->not->toBe(PrintToken::for($this->document));
});
