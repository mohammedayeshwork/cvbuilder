<?php

namespace App\Http\Resources;

use App\Documents\ContentMigrator;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Document
 */
class DocumentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $migrator = app(ContentMigrator::class);

        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'title' => $this->title,
            'template_key' => $this->template_key,
            'content' => $migrator->content($this->type, $this->content),
            'design' => $migrator->design($this->design),
            'linked_resume_id' => $this->linked_resume_id,
            'is_public' => $this->is_public,
            'share_slug' => $this->share_slug,
            'revision' => $this->revision,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
