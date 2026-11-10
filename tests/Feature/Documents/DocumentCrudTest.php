<?php

use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\User;
use Database\Factories\DocumentFactory;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('lists only the user’s own documents on the dashboard', function () {
    $mine = Document::factory()->for($this->user)->create();
    Document::factory()->for($this->user)->coverLetter()->create();
    Document::factory()->create();

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('documents', 2)
            ->where('documents.1.id', $mine->id));
});

it('creates a resume from a template', function () {
    $sample = DocumentFactory::sample('minimal');

    $response = $this->postJson(route('documents.store'), [
        'type' => 'resume',
        'template_key' => 'minimal',
        'content' => $sample->content,
        'design' => $sample->design,
    ]);

    $document = Document::sole();

    $response->assertRedirect(route('documents.edit', $document));
    expect($document)
        ->user_id->toBe($this->user->id)
        ->type->toBe(DocumentType::Resume)
        ->title->toBe('Untitled Resume')
        ->template_key->toBe('minimal')
        ->revision->toBe(1);
});

it('rejects unknown templates and invalid content', function () {
    $sample = DocumentFactory::sample('classic');

    $this->postJson(route('documents.store'), [
        'type' => 'resume',
        'template_key' => 'nope',
        'content' => $sample->content,
        'design' => $sample->design,
    ])->assertUnprocessable()->assertJsonValidationErrors('template_key');

    $this->postJson(route('documents.store'), [
        'type' => 'resume',
        'template_key' => 'classic',
        'content' => ['version' => 1, 'sections' => []],
        'design' => $sample->design,
    ])->assertUnprocessable()->assertJsonValidationErrors('content.sections');

    expect(Document::count())->toBe(0);
});

it('only links cover letters to the user’s own resumes', function () {
    $foreign = Document::factory()->create();
    $letter = Document::factory()->coverLetter()->make();

    $this->postJson(route('documents.store'), [
        'type' => 'cover_letter',
        'template_key' => 'classic',
        'linked_resume_id' => $foreign->id,
        'content' => $letter->content,
        'design' => $letter->design,
    ])->assertJsonValidationErrors('linked_resume_id');

    $own = Document::factory()->for($this->user)->create();

    $this->postJson(route('documents.store'), [
        'type' => 'cover_letter',
        'template_key' => 'classic',
        'linked_resume_id' => $own->id,
        'content' => $letter->content,
        'design' => $letter->design,
    ])->assertRedirect();

    expect(Document::where('type', 'cover_letter')->sole()->linked_resume_id)->toBe($own->id);
});

it('renames a document', function () {
    $document = Document::factory()->for($this->user)->create();

    $this->patch(route('documents.rename', $document), ['title' => '  Finance roles  '])->assertRedirect();

    expect($document->fresh()->title)->toBe('Finance roles');
});

it('renames over JSON without a redirect', function () {
    $document = Document::factory()->for($this->user)->create();

    $this->patchJson(route('documents.rename', $document), ['title' => 'From the editor'])->assertNoContent();

    expect($document->fresh()->title)->toBe('From the editor');
});

it('duplicates a document without its share link', function () {
    $document = Document::factory()->for($this->user)->shared()->create(['revision' => 7]);

    $this->post(route('documents.duplicate', $document))->assertRedirect();

    $copy = Document::latest('id')->first();

    expect($copy)
        ->id->not->toBe($document->id)
        ->title->toBe($document->title.' (copy)')
        ->content->toEqual($document->content)
        ->is_public->toBeFalse()
        ->share_slug->toBeNull()
        ->revision->toBe(1);
});

it('soft deletes a document', function () {
    $document = Document::factory()->for($this->user)->create();

    $this->delete(route('documents.destroy', $document))->assertRedirect(route('dashboard'));

    expect($document->fresh()->trashed())->toBeTrue();
});
