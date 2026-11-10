<?php

namespace App\Enums;

enum DocumentType: string
{
    case Resume = 'resume';
    case CoverLetter = 'cover_letter';

    public function label(): string
    {
        return match ($this) {
            self::Resume => 'Resume',
            self::CoverLetter => 'Cover Letter',
        };
    }
}
