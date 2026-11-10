<?php

namespace App\Documents;

use App\Models\Document;

/**
 * A secret header that, together with a short-lived signed URL, lets the
 * headless browser open a document's print page. The URL alone is not
 * enough, so a leaked link cannot be replayed from a normal browser.
 */
class PrintToken
{
    public const HEADER = 'X-Print-Token';

    public static function for(Document $document): string
    {
        return hash_hmac('sha256', "print:{$document->id}", (string) config('app.key'));
    }

    public static function matches(Document $document, ?string $token): bool
    {
        return $token !== null && hash_equals(self::for($document), $token);
    }
}
