<?php

namespace Database\Factories;

use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use stdClass;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state: a resume built from a sample persona.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sample = self::sample('classic');

        return [
            'user_id' => User::factory(),
            'type' => DocumentType::Resume,
            'title' => $sample->title,
            'template_key' => $sample->template_key,
            'content' => $sample->content,
            'design' => $sample->design,
        ];
    }

    /**
     * Use the sample persona that belongs to a template.
     */
    public function fromSample(string $templateKey): static
    {
        return $this->state(function () use ($templateKey) {
            $sample = self::sample($templateKey);

            return [
                'title' => $sample->title,
                'template_key' => $sample->template_key,
                'content' => $sample->content,
                'design' => $sample->design,
            ];
        });
    }

    public function coverLetter(): static
    {
        return $this->state(function () {
            $sender = clone self::sample('classic')->content->sections[0]->items[0];
            unset($sender->id);

            return [
                'type' => DocumentType::CoverLetter,
                'title' => 'Cover Letter — Harrow & Lane',
                'content' => (object) [
                    'version' => 1,
                    'sender' => $sender,
                    'date' => '2026-11-10',
                    'recipient' => (object) [
                        'name' => 'Daniel Brooks',
                        'title' => 'Head of Finance',
                        'company' => 'Harrow & Lane Retail Group',
                        'address' => '1 Kingsway, London WC2B 6AN',
                    ],
                    'greeting' => 'Dear Mr Brooks,',
                    'body' => '<p>I am writing to apply for the Finance Manager role.</p>',
                    'closing' => 'Sincerely,',
                    'signature' => 'Eleanor Whitfield',
                ],
            ];
        });
    }

    public function shared(): static
    {
        return $this->state(fn () => [
            'is_public' => true,
            'share_slug' => fake()->regexify('[A-Za-z0-9]{32}'),
        ]);
    }

    public static function sample(string $templateKey): stdClass
    {
        $path = resource_path("samples/{$templateKey}.json");

        return json_decode((string) file_get_contents($path), false, 512, JSON_THROW_ON_ERROR);
    }
}
