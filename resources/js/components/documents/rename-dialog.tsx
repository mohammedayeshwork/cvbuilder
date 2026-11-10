import { router } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import documents from '@/routes/documents';
import type { CvDocument } from '@/types';

export function RenameDialog({
    document,
    onOpenChange,
}: {
    document: CvDocument | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={document !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                {document && (
                    <RenameForm
                        document={document}
                        onDone={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function RenameForm({
    document,
    onDone,
}: {
    document: CvDocument;
    onDone: () => void;
}) {
    const [title, setTitle] = useState(document.title);
    const [error, setError] = useState<string>();
    const [processing, setProcessing] = useState(false);

    return (
        <form
            className="grid gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                router.patch(
                    documents.rename.url(document),
                    { title },
                    {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                        onSuccess: onDone,
                        onError: (errors) => setError(errors.title),
                    },
                );
            }}
        >
            <DialogHeader>
                <DialogTitle>Rename document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
                <Label htmlFor="document-title">Title</Label>
                <Input
                    id="document-title"
                    value={title}
                    maxLength={120}
                    autoFocus
                    onChange={(event) => setTitle(event.target.value)}
                />
                <InputError message={error} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    type="submit"
                    disabled={processing || title.trim() === ''}
                >
                    Save
                </Button>
            </DialogFooter>
        </form>
    );
}
