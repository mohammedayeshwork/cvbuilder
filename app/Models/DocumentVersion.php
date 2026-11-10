<?php

namespace App\Models;

use App\Casts\JsonObject;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use stdClass;

/**
 * @property int $id
 * @property int $document_id
 * @property string $template_key
 * @property stdClass $content
 * @property stdClass $design
 * @property Carbon|null $created_at
 */
#[Fillable(['template_key', 'content', 'design'])]
class DocumentVersion extends Model
{
    public const UPDATED_AT = null;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => JsonObject::class,
            'design' => JsonObject::class,
        ];
    }

    /**
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
