<?php

namespace Database\Seeders;

use App\Documents\DocumentValidator;
use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\User;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Seeder;

/**
 * One resume per sample persona (resources/samples), plus a cover letter
 * linked to the Classic resume.
 */
class SampleDocumentSeeder extends Seeder
{
    public function run(User $user, DocumentValidator $validator): void
    {
        $classic = null;

        foreach ($validator->templates() as $key) {
            $sample = DocumentFactory::sample($key);

            $document = $user->documents()->create([
                'type' => DocumentType::Resume,
                'title' => $sample->title,
                'template_key' => $key,
                'content' => $validator->content(DocumentType::Resume, $sample->content),
                'design' => $validator->design($sample->design),
            ]);

            $classic ??= $document;
        }

        Document::factory()
            ->for($user)
            ->coverLetter()
            ->create(['template_key' => 'classic', 'linked_resume_id' => $classic?->id]);
    }
}
