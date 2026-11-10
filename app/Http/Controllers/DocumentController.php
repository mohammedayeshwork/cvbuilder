<?php

namespace App\Http\Controllers;

use App\Documents\DocumentValidator;
use App\Enums\DocumentType;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(private DocumentValidator $validator) {}

    public function index(Request $request): Response
    {
        $documents = $request->user()->documents()->latest('updated_at')->get();

        return Inertia::render('dashboard', [
            'documents' => DocumentResource::collection($documents)->resolve(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::enum(DocumentType::class)],
            'template_key' => ['required', 'string', Rule::in($this->validator->templates())],
            'title' => ['nullable', 'string', 'max:120'],
            'linked_resume_id' => [
                'nullable',
                'integer',
                Rule::exists('documents', 'id')->where(fn ($query) => $query
                    ->where('user_id', $request->user()->id)
                    ->where('type', DocumentType::Resume->value)
                    ->whereNull('deleted_at')),
            ],
        ]);

        $type = DocumentType::from($data['type']);
        $body = $this->jsonBody($request);

        $document = $request->user()->documents()->create([
            'type' => $type,
            'title' => $data['title'] ?? 'Untitled '.$type->label(),
            'template_key' => $data['template_key'],
            'content' => $this->validator->content($type, $body->content ?? null),
            'design' => $this->validator->design($body->design ?? null),
            'linked_resume_id' => $type === DocumentType::CoverLetter ? ($data['linked_resume_id'] ?? null) : null,
        ]);

        return to_route('documents.edit', $document);
    }

    public function edit(Document $document): Response
    {
        return Inertia::render('documents/edit', [
            'document' => DocumentResource::make($document)->resolve(),
        ]);
    }

    /**
     * Autosave. Saves only if the client's revision matches, so two tabs
     * cannot silently overwrite each other; a mismatch returns 409.
     */
    public function update(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'revision' => ['required', 'integer'],
            'template_key' => ['sometimes', 'string', Rule::in($this->validator->templates())],
        ]);

        $revision = (int) $data['revision'];

        if ($revision !== $document->revision) {
            return $this->conflict($document);
        }

        $body = $this->jsonBody($request);

        if (property_exists($body, 'content')) {
            $document->content = $this->validator->content($document->type, $body->content);
        }

        if (property_exists($body, 'design')) {
            $document->design = $this->validator->design($body->design);
        }

        if (isset($data['template_key'])) {
            $document->template_key = $data['template_key'];
        }

        $changes = $document->getDirty();

        if ($changes === []) {
            return response()->json(['revision' => $revision, 'updated_at' => $document->updated_at?->toIso8601String()]);
        }

        $original = Document::query()->findOrFail($document->id);

        if (isset($changes['template_key'])) {
            $original->snapshot();
        } else {
            $original->snapshotIfDue();
        }

        $now = $document->freshTimestamp();

        // Compare-and-swap on revision; $changes holds the already-encoded column values.
        $saved = Document::query()
            ->whereKey($document->id)
            ->where('revision', $revision)
            ->update([...$changes, 'revision' => $revision + 1, 'updated_at' => $now]);

        if ($saved === 0) {
            return $this->conflict($document->refresh());
        }

        return response()->json(['revision' => $revision + 1, 'updated_at' => $now->toIso8601String()]);
    }

    public function rename(Request $request, Document $document): RedirectResponse|HttpResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:120']]);

        $document->update(['title' => trim($data['title'])]);

        return $request->expectsJson() ? response()->noContent() : back();
    }

    public function duplicate(Document $document): RedirectResponse
    {
        $copy = $document->replicate(['share_slug', 'is_public', 'revision']);
        $copy->title = Str::limit($document->title, 110, '').' (copy)';
        $copy->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document duplicated.')]);

        return back();
    }

    public function destroy(Document $document): RedirectResponse
    {
        $document->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Document deleted.')]);

        return to_route('dashboard');
    }

    private function conflict(Document $document): JsonResponse
    {
        return response()->json([
            'message' => 'This document was changed in another tab or window. Reload to get the latest version.',
            'revision' => $document->getOriginal('revision'),
        ], 409);
    }

    /**
     * The request body decoded as objects, so empty JSON objects stay objects.
     */
    private function jsonBody(Request $request): object
    {
        $body = $request->isJson() ? json_decode($request->getContent()) : null;

        return is_object($body) ? $body : new \stdClass;
    }
}
