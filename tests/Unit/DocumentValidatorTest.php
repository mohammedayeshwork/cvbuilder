<?php

use App\Documents\DocumentValidator;
use App\Enums\DocumentType;
use App\Models\Document;
use Database\Factories\DocumentFactory;
use Illuminate\Validation\ValidationException;

function resumeSample(string $key = 'classic'): stdClass
{
    return DocumentFactory::sample($key)->content;
}

function errorsFor(callable $validate): array
{
    try {
        $validate();
    } catch (ValidationException $e) {
        return $e->errors();
    }

    return [];
}

it('accepts every sample persona', function (string $key) {
    $sample = DocumentFactory::sample($key);
    $validator = app(DocumentValidator::class);

    expect($validator->content(DocumentType::Resume, $sample->content))->toBeInstanceOf(stdClass::class)
        ->and($validator->design($sample->design))->toBeInstanceOf(stdClass::class);
})->with(['classic', 'modern-split', 'bold-header', 'minimal', 'timeline', 'compact']);

it('rejects broken resumes', function (Closure $break, string $key) {
    $content = resumeSample();
    $break($content);

    $errors = errorsFor(fn () => app(DocumentValidator::class)->content(DocumentType::Resume, $content));

    expect($errors)->toHaveKey($key);
})->with([
    'bad month' => [fn ($c) => $c->sections[2]->items[0]->start = '2021-13', 'content.sections.2.items.0.start'],
    'javascript link' => [fn ($c) => $c->sections[2]->items[0]->link = 'javascript:alert(1)', 'content.sections.2.items.0.link'],
    'unknown key' => [fn ($c) => $c->sections[2]->items[0]->salary = '1m', 'content.sections.2.items.0'],
    'unknown section type' => [fn ($c) => $c->sections[2]->type = 'hobbies', 'content.sections.2.type'],
    'skill level' => [fn ($c) => $c->sections[5]->items[0]->level = 9, 'content.sections.5.items.0.level'],
    'duplicate id' => [fn ($c) => $c->sections[3]->id = $c->sections[2]->id, 'content.sections.3.id'],
    'header not first' => [fn ($c) => $c->sections = [$c->sections[1], $c->sections[0]], 'content.sections'],
    'two headers' => [fn ($c) => $c->sections[] = clone $c->sections[0], 'content.sections'],
    'second summary item' => [fn ($c) => $c->sections[1]->items[] = $c->sections[1]->items[0], 'content.sections.1.items'],
    'wrong version' => [fn ($c) => $c->version = 2, 'content.version'],
    'fake photo' => [fn ($c) => $c->sections[0]->items[0]->photo = (object) ['src' => 'data:image/png;base64,'.base64_encode('<svg onload=alert(1)>'), 'shape' => 'round'], 'content.sections.0.items.0.photo.src'],
    'svg photo' => [fn ($c) => $c->sections[0]->items[0]->photo = (object) ['src' => 'data:image/svg+xml;base64,PHN2Zz4=', 'shape' => 'round'], 'content.sections.0.items.0.photo.src'],
]);

it('accepts a real photo', function () {
    $content = resumeSample();
    $png = base64_encode(base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='));
    $content->sections[0]->items[0]->photo = (object) ['src' => "data:image/png;base64,{$png}", 'shape' => 'square'];

    expect(app(DocumentValidator::class)->content(DocumentType::Resume, $content)->sections[0]->items[0]->photo->shape)
        ->toBe('square');
});

it('validates cover letters', function () {
    $letter = Document::factory()->coverLetter()->make()->content;
    $validator = app(DocumentValidator::class);

    expect($validator->content(DocumentType::CoverLetter, $letter)->greeting)->toBe('Dear Mr Brooks,');

    $letter->date = 'tomorrow';
    expect(errorsFor(fn () => $validator->content(DocumentType::CoverLetter, $letter)))->toHaveKey('content.date');
});

it('rejects non-object input', function () {
    expect(errorsFor(fn () => app(DocumentValidator::class)->content(DocumentType::Resume, [])))
        ->toHaveKey('content');
});
