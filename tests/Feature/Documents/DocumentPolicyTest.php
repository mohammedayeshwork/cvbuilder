<?php

use App\Models\Document;
use App\Models\User;

beforeEach(function () {
    $this->document = Document::factory()->create();
    $this->intruder = User::factory()->create();
});

it('forbids other users on every document route', function (string $method, string $route, array $body = []) {
    $this->actingAs($this->intruder)
        ->json($method, route($route, $this->document), $body)
        ->assertForbidden();
})->with([
    'edit' => ['GET', 'documents.edit'],
    'autosave' => ['PATCH', 'documents.update', ['revision' => 1]],
    'rename' => ['PATCH', 'documents.rename', ['title' => 'Mine now']],
    'duplicate' => ['POST', 'documents.duplicate'],
    'delete' => ['DELETE', 'documents.destroy'],
]);

it('leaves the document untouched after forbidden requests', function () {
    $this->actingAs($this->intruder);

    $this->patchJson(route('documents.rename', $this->document), ['title' => 'Mine now']);
    $this->deleteJson(route('documents.destroy', $this->document));

    expect($this->document->fresh())
        ->title->toBe('Eleanor Whitfield — Senior Financial Analyst')
        ->deleted_at->toBeNull();
});

it('redirects guests to the login page', function () {
    $this->get(route('documents.edit', $this->document))->assertRedirect(route('login'));
});

it('lets the owner open the editor', function () {
    $this->actingAs($this->document->user)
        ->get(route('documents.edit', $this->document))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('documents/edit')
            ->where('document.id', $this->document->id));
});

it('returns 404 for soft-deleted documents', function () {
    $this->document->delete();

    $this->actingAs($this->document->user)
        ->get(route('documents.edit', $this->document))
        ->assertNotFound();
});
