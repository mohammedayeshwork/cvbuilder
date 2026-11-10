import { AlertCircle, Check, CloudUpload, Loader2 } from 'lucide-react';
import type { SaveStatus } from '../autosave';

const LABELS: Record<SaveStatus, string> = {
    saved: 'Saved',
    pending: 'Unsaved changes',
    saving: 'Saving…',
    error: 'Not saved',
    conflict: 'Changed elsewhere',
};

export function SaveIndicator({
    status,
    error,
}: {
    status: SaveStatus;
    error: string | null;
}) {
    const Icon = {
        saved: Check,
        pending: CloudUpload,
        saving: Loader2,
        error: AlertCircle,
        conflict: AlertCircle,
    }[status];

    return (
        <span
            role="status"
            aria-live="polite"
            title={error ?? undefined}
            data-status={status}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground data-[status=conflict]:text-destructive data-[status=error]:text-destructive"
        >
            <Icon
                className={
                    status === 'saving' ? 'size-3.5 animate-spin' : 'size-3.5'
                }
                aria-hidden
            />
            {LABELS[status]}
        </span>
    );
}
