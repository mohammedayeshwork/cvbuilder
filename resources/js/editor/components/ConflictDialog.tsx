import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

/** Shown when another tab or device saved this document first. */
export function ConflictDialog({ open }: { open: boolean }) {
    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        This document changed somewhere else
                    </DialogTitle>
                    <DialogDescription>
                        It was saved from another tab or device after you opened
                        it. Reload to continue with the latest version. Your
                        changes from this tab since then will not be saved.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => router.reload()}>Reload</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
