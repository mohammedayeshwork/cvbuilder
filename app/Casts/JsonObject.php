<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use stdClass;

/**
 * Stores JSON and reads it back as objects rather than arrays, so an empty
 * object ({}) survives the round trip instead of turning into [].
 *
 * @implements CastsAttributes<stdClass, stdClass|array<string, mixed>>
 */
class JsonObject implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?stdClass
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, false, 512, JSON_THROW_ON_ERROR);

        return $decoded instanceof stdClass ? $decoded : new stdClass;
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
