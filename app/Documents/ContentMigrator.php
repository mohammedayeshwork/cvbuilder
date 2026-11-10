<?php

namespace App\Documents;

use App\Enums\DocumentType;
use RuntimeException;
use stdClass;

/**
 * Upgrades stored documents to the current schema version when they are read.
 * Mirrors resources/js/schema/migrations.ts; add every step to both.
 */
class ContentMigrator
{
    public const LATEST = [
        'resume' => 1,
        'cover_letter' => 1,
        'design' => 1,
    ];

    /**
     * Upgrade steps keyed by kind, then by the version they upgrade FROM.
     *
     * @var array<string, array<int, callable(stdClass): stdClass>>
     */
    private array $steps = [
        'resume' => [],
        'cover_letter' => [],
        'design' => [],
    ];

    public function content(DocumentType $type, stdClass $content): stdClass
    {
        return $this->migrate($type->value, $content);
    }

    public function design(stdClass $design): stdClass
    {
        return $this->migrate('design', $design);
    }

    public function migrate(string $kind, stdClass $doc): stdClass
    {
        $doc = clone $doc;
        $version = is_int($doc->version ?? null) ? $doc->version : 1;

        while ($version < self::LATEST[$kind]) {
            $step = $this->steps[$kind][$version]
                ?? throw new RuntimeException("No {$kind} migration from v{$version}");

            $doc = $step($doc);
            $version++;
        }

        $doc->version = $version;

        return $doc;
    }
}
