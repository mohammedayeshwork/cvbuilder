<?php

namespace App\Console\Commands;

use App\Documents\PrintToken;
use App\Models\Document;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\URL;

/**
 * Prints a signed print URL and its token as JSON, for local PDF checks
 * (scripts/pdf-visual-check.mjs).
 */
#[Signature('documents:print-url {document : Document id} {--minutes=10}')]
#[Description('Show a signed print URL and token for a document')]
class PrintUrl extends Command
{
    public function handle(): int
    {
        $document = Document::query()->findOrFail($this->argument('document'));

        $this->line((string) json_encode([
            'path' => URL::temporarySignedRoute('documents.print', now()->addMinutes((int) $this->option('minutes')), ['document' => $document], absolute: false),
            'header' => PrintToken::HEADER,
            'token' => PrintToken::for($document),
        ], JSON_UNESCAPED_SLASHES));

        return self::SUCCESS;
    }
}
