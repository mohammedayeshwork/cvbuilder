<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

/**
 * Documents are private to their owner. Public share pages do not go
 * through this policy; they are looked up by slug and is_public.
 */
class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        return $this->owns($user, $document);
    }

    public function update(User $user, Document $document): bool
    {
        return $this->owns($user, $document);
    }

    public function delete(User $user, Document $document): bool
    {
        return $this->owns($user, $document);
    }

    public function export(User $user, Document $document): bool
    {
        return $this->owns($user, $document);
    }

    public function share(User $user, Document $document): bool
    {
        return $this->owns($user, $document);
    }

    private function owns(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }
}
