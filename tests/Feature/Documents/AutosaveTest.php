<?php

use App\Models\Document;
use App\Models\DocumentVersion;

beforeEach(function () {
    $this->document = Document::factory()->create();
    $this->actingAs($this->document->user);
});

function editedContent(Document $document, string $summary): stdClass
{
    $content = $document->content;
    $content->sections[1]->items[0]->text = $summary;

    return $content;
}

it('saves content and bumps the revision', function () {
    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 1,
        'content' => editedContent($this->document, '<p>New summary</p>'),
    ])->assertOk()->assertJson(['revision' => 2]);

    $fresh = $this->document->fresh();

    expect($fresh->revision)->toBe(2)
        ->and($fresh->content->sections[1]->items[0]->text)->toBe('<p>New summary</p>');
});

it('returns 409 when the revision is stale', function () {
    $this->document->forceFill(['revision' => 5])->save();

    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 4,
        'content' => editedContent($this->document, '<p>Old tab</p>'),
    ])->assertStatus(409)->assertJson(['revision' => 5]);

    expect($this->document->fresh()->content->sections[1]->items[0]->text)->not->toBe('<p>Old tab</p>');
});

it('strips scripts and unsafe links from rich text', function () {
    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 1,
        'content' => editedContent(
            $this->document,
            '<p onmouseover="steal()">Hi<script>alert(1)</script><img src=x onerror=alert(1)> <a href="javascript:alert(1)">x</a> <a href="https://ok.example">ok</a></p>',
        ),
    ])->assertOk();

    $html = $this->document->fresh()->content->sections[1]->items[0]->text;

    expect($html)
        ->not->toContain('script')
        ->not->toContain('onerror')
        ->not->toContain('onmouseover')
        ->not->toContain('javascript:')
        ->not->toContain('<img')
        ->toContain('<a href="https://ok.example" rel="noopener noreferrer">ok</a>');
});

it('keeps empty settings objects as objects', function () {
    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 1,
        'content' => editedContent($this->document, '<p>x</p>'),
    ])->assertOk();

    $raw = $this->document->fresh()->getRawOriginal('content');

    expect($raw)->toContain('"type":"summary","title":"Summary","column":"main","pageBreakBefore":false,"settings":{}');

    $this->get(route('documents.edit', $this->document))
        ->assertInertia(fn ($page) => $page->where('document.content.sections.1.settings', []));
});

it('rejects invalid content with the exact field path', function () {
    $content = $this->document->content;
    $content->sections[2]->items[0]->start = '2021-13';

    $this->patchJson(route('documents.update', $this->document), ['revision' => 1, 'content' => $content])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('content.sections.2.items.0.start');
});

it('saves design overrides and template switches', function () {
    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 1,
        'template_key' => 'timeline',
        'design' => ['version' => 1, 'accent' => '#1d4ed8', 'fontSize' => 10.5],
    ])->assertOk();

    expect($this->document->fresh())
        ->template_key->toBe('timeline')
        ->design->accent->toBe('#1d4ed8');

    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 2,
        'design' => ['version' => 1, 'fontSize' => 30],
    ])->assertJsonValidationErrors('design.fontSize');
});

it('snapshots before a template switch and at most every 10 minutes', function () {
    $save = fn (int $revision, string $text) => $this->patchJson(route('documents.update', $this->document), [
        'revision' => $revision,
        'content' => editedContent($this->document->fresh(), $text),
    ])->assertOk();

    $save(1, '<p>a</p>');
    $save(2, '<p>b</p>');
    expect(DocumentVersion::count())->toBe(1);

    $this->travel(11)->minutes();
    $save(3, '<p>c</p>');
    expect(DocumentVersion::count())->toBe(2);

    $this->patchJson(route('documents.update', $this->document), ['revision' => 4, 'template_key' => 'compact'])->assertOk();
    expect(DocumentVersion::count())->toBe(3)
        ->and($this->document->versions()->first()->template_key)->toBe('classic');
});

it('keeps only the newest 20 versions', function () {
    foreach (range(1, 25) as $i) {
        $this->travel(1)->minutes();
        $this->document->snapshot();
    }

    $versions = $this->document->versions()->get();

    expect($versions)->toHaveCount(Document::MAX_VERSIONS)
        ->and($versions->first()->created_at->gt($versions->last()->created_at))->toBeTrue();
});

it('does not bump the revision when nothing changed', function () {
    $this->patchJson(route('documents.update', $this->document), [
        'revision' => 1,
        'content' => $this->document->content,
    ])->assertOk()->assertJson(['revision' => 1]);
});
