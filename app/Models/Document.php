<?php

namespace App\Models;

use App\Casts\JsonObject;
use App\Enums\DocumentType;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use stdClass;

/**
 * @property int $id
 * @property int $user_id
 * @property DocumentType $type
 * @property string $title
 * @property string $template_key
 * @property stdClass $content
 * @property stdClass $design
 * @property int|null $linked_resume_id
 * @property string|null $share_slug
 * @property bool $is_public
 * @property int $revision
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['type', 'title', 'template_key', 'content', 'design', 'linked_resume_id'])]
class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory, SoftDeletes;

    /** Versions kept per document; older snapshots are pruned. */
    public const MAX_VERSIONS = 20;

    /** Minimum minutes between automatic snapshots while editing. */
    public const SNAPSHOT_INTERVAL_MINUTES = 10;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => DocumentType::class,
            'content' => JsonObject::class,
            'design' => JsonObject::class,
            'is_public' => 'boolean',
            'revision' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Document, $this>
     */
    public function linkedResume(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'linked_resume_id');
    }

    /**
     * @return HasMany<DocumentVersion, $this>
     */
    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class)->latest('created_at')->latest('id');
    }

    /**
     * Store a snapshot of the current state and prune old ones.
     */
    public function snapshot(): DocumentVersion
    {
        $version = $this->versions()->create([
            'template_key' => $this->template_key,
            'content' => $this->content,
            'design' => $this->design,
        ]);

        $keep = $this->versions()->limit(self::MAX_VERSIONS)->pluck('id');
        $this->versions()->getQuery()->whereNotIn('id', $keep)->delete();

        return $version;
    }

    /**
     * Snapshot only if the last one is older than the interval.
     */
    public function snapshotIfDue(): ?DocumentVersion
    {
        $last = $this->versions()->value('created_at');

        if ($last !== null && Carbon::parse($last)->gt(now()->subMinutes(self::SNAPSHOT_INTERVAL_MINUTES))) {
            return null;
        }

        return $this->snapshot();
    }
}
