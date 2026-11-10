import { useState } from 'react';
import { toast } from 'sonner';
import { sendJson } from '@/lib/http';
import documents from '@/routes/documents';

/** The document title, renamed in place. */
export function TitleField({ id, initial }: { id: number; initial: string }) {
    const [title, setTitle] = useState(initial);
    const [saved, setSaved] = useState(initial);

    const commit = async () => {
        const next = title.trim();

        if (next === '' || next === saved) {
            setTitle(saved);
            return;
        }

        try {
            await sendJson('PATCH', documents.rename.url(id), { title: next });
            setSaved(next);
            setTitle(next);
            document.title = document.title.replace(saved, next);
        } catch {
            toast.error('Could not rename the document.');
            setTitle(saved);
        }
    };

    return (
        <input
            aria-label="Document title"
            value={title}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }
                if (event.key === 'Escape') {
                    setTitle(saved);
                    requestAnimationFrame(() =>
                        (event.target as HTMLInputElement).blur(),
                    );
                }
            }}
            className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-2 py-1 font-medium hover:border-input focus:border-input focus:outline-none sm:max-w-80"
        />
    );
}
