<?php

namespace App\Documents;

use App\Enums\DocumentType;
use Illuminate\Validation\ValidationException;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Errors\ValidationError;
use Opis\JsonSchema\Validator;
use stdClass;

/**
 * Validates document JSON against the schemas exported from the Zod source
 * (resources/schema/*.json), applies the rules JSON Schema cannot express,
 * and sanitizes every rich text field.
 */
class DocumentValidator
{
    private const SCHEMA_PREFIX = 'https://cvbuilder.local/schema/';

    /** Decoded photo bytes allowed in a header photo. */
    public const MAX_PHOTO_BYTES = 200 * 1024;

    private Validator $validator;

    /** @var array{documentTypes: list<string>, templates: list<string>, sectionTypes: list<string>, richTextKeys: list<string>} */
    private array $meta;

    public function __construct(private RichTextSanitizer $sanitizer)
    {
        $this->validator = new Validator(max_errors: 10);
        $this->validator->resolver()?->registerPrefix(self::SCHEMA_PREFIX, resource_path('schema'));
        $this->meta = json_decode((string) file_get_contents(resource_path('schema/meta.json')), true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * @return list<string>
     */
    public function templates(): array
    {
        return $this->meta['templates'];
    }

    /**
     * Validate and sanitize document content. Error keys are prefixed with $field.
     *
     * @throws ValidationException
     */
    public function content(DocumentType $type, mixed $content, string $field = 'content'): stdClass
    {
        $schema = $type === DocumentType::Resume ? 'resume.json' : 'cover-letter.json';

        $this->validateSchema($content, $schema, $field);

        /** @var stdClass $content */
        if ($type === DocumentType::Resume) {
            $this->validateResumeRules($content, $field);
        } else {
            $this->validatePhoto($content->sender->photo ?? null, "{$field}.sender.photo");
        }

        return $this->sanitize($content);
    }

    /**
     * @throws ValidationException
     */
    public function design(mixed $design, string $field = 'design'): stdClass
    {
        $this->validateSchema($design, 'design.json', $field);

        /** @var stdClass $design */
        return $design;
    }

    /**
     * @throws ValidationException
     */
    private function validateSchema(mixed $data, string $schema, string $field): void
    {
        if (! $data instanceof stdClass) {
            throw ValidationException::withMessages([$field => 'Must be a JSON object.']);
        }

        $result = $this->validator->validate($data, self::SCHEMA_PREFIX.$schema);

        if ($result->isValid()) {
            return;
        }

        /** @var ValidationError $error */
        $error = $result->error();
        $messages = [];

        foreach ((new ErrorFormatter)->formatKeyed($error) as $pointer => $list) {
            $path = trim(str_replace('/', '.', $pointer), '.');
            $messages[$path === '' ? $field : "{$field}.{$path}"] = $list;
        }

        throw ValidationException::withMessages($messages);
    }

    /**
     * @throws ValidationException
     */
    private function validateResumeRules(stdClass $content, string $field): void
    {
        $errors = [];
        $sections = $content->sections;
        $counts = array_count_values(array_map(fn (stdClass $s) => $s->type, $sections));

        if (($counts['header'] ?? 0) !== 1 || $sections[0]->type !== 'header') {
            $errors["{$field}.sections"] = 'A resume needs exactly one header, as its first section.';
        }

        if (($counts['summary'] ?? 0) > 1) {
            $errors["{$field}.sections"] = 'A resume can have only one summary.';
        }

        $seen = [];

        foreach ($sections as $s => $section) {
            $ids = [[$section->id, "{$field}.sections.{$s}.id"]];

            foreach ($section->items as $i => $item) {
                $ids[] = [$item->id, "{$field}.sections.{$s}.items.{$i}.id"];

                foreach ($item->links ?? [] as $l => $link) {
                    $ids[] = [$link->id, "{$field}.sections.{$s}.items.{$i}.links.{$l}.id"];
                }
            }

            foreach ($ids as [$id, $path]) {
                if (isset($seen[$id])) {
                    $errors[$path] = "Duplicate id \"{$id}\".";
                }
                $seen[$id] = true;
            }

            if ($section->type === 'header') {
                try {
                    $this->validatePhoto($section->items[0]->photo, "{$field}.sections.{$s}.items.0.photo");
                } catch (ValidationException $e) {
                    $errors += array_map(fn (array $m) => $m[0], $e->errors());
                }
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * A photo must be a real WebP, JPEG or PNG of at most MAX_PHOTO_BYTES.
     *
     * @throws ValidationException
     */
    private function validatePhoto(mixed $photo, string $path): void
    {
        if (! $photo instanceof stdClass) {
            return;
        }

        [$header, $data] = explode(',', $photo->src, 2);
        $bytes = base64_decode($data, true);
        $mime = substr($header, 5, -7);

        $valid = $bytes !== false
            && strlen($bytes) <= self::MAX_PHOTO_BYTES
            && match ($mime) {
                'image/webp' => str_starts_with($bytes, 'RIFF') && substr($bytes, 8, 4) === 'WEBP',
                'image/jpeg' => str_starts_with($bytes, "\xFF\xD8\xFF"),
                'image/png' => str_starts_with($bytes, "\x89PNG\r\n\x1A\n"),
                default => false,
            };

        if (! $valid) {
            throw ValidationException::withMessages([
                "{$path}.src" => 'The photo must be a WebP, JPEG or PNG image of at most 200 KB.',
            ]);
        }
    }

    /**
     * Sanitize every rich text field, wherever it appears.
     */
    private function sanitize(stdClass $node): stdClass
    {
        $keys = array_flip($this->meta['richTextKeys']);

        $walk = function (mixed $value, ?string $key) use (&$walk, $keys): mixed {
            if ($value instanceof stdClass) {
                foreach (get_object_vars($value) as $k => $v) {
                    $value->{$k} = $walk($v, $k);
                }

                return $value;
            }

            if (is_array($value)) {
                return array_map(fn ($v) => $walk($v, null), $value);
            }

            if (is_string($value) && $key !== null && isset($keys[$key])) {
                return $this->sanitizer->sanitize($value);
            }

            return $value;
        };

        return $walk($node, null);
    }
}
