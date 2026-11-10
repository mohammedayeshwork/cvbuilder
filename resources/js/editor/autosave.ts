import { useEffect, useRef, useState } from 'react';
import { HttpError, sendJson } from '@/lib/http';
import type { EditorStore } from './store';

export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict';

export const AUTOSAVE_DELAY_MS = 1000;
const RETRY_DELAY_MS = 5000;

/**
 * Saves content, design and template 1 s after the last change. Each save
 * carries the revision it was based on; a 409 means another tab saved first,
 * and saving stops until the user reloads.
 */
export function useAutosave(
    store: EditorStore,
    url: string,
    initialRevision: number,
) {
    const [status, setStatus] = useState<SaveStatus>('saved');
    const [error, setError] = useState<string | null>(null);
    const revision = useRef(initialRevision);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const inFlight = useRef(false);
    const dirty = useRef(false);
    const stopped = useRef(false);

    useEffect(() => {
        const payload = () => {
            const { content, design, template_key } = store.getState();
            return {
                revision: revision.current,
                content,
                design,
                template_key,
            };
        };

        const save = async (): Promise<void> => {
            if (stopped.current || inFlight.current || !dirty.current) {
                return;
            }

            inFlight.current = true;
            dirty.current = false;
            setStatus('saving');
            let next: 'continue' | 'retry' | 'wait' = 'continue';

            try {
                const result = await sendJson<{ revision: number }>(
                    'PATCH',
                    url,
                    payload(),
                );
                revision.current = result.revision;
                setError(null);
                setStatus(dirty.current ? 'pending' : 'saved');
            } catch (caught) {
                dirty.current = true;

                if (caught instanceof HttpError && caught.status === 409) {
                    stopped.current = true;
                    setStatus('conflict');
                } else if (
                    caught instanceof HttpError &&
                    caught.status === 422
                ) {
                    // Invalid content will not fix itself; wait for the next edit.
                    next = 'wait';
                    setError(caught.message);
                    setStatus('error');
                } else {
                    next = 'retry';
                    setError('Could not reach the server. Retrying…');
                    setStatus('error');
                }
            } finally {
                inFlight.current = false;
            }

            if (stopped.current || !dirty.current || next === 'wait') {
                return;
            }

            clearTimeout(timer.current);
            timer.current = setTimeout(
                () => void save(),
                next === 'retry' ? RETRY_DELAY_MS : AUTOSAVE_DELAY_MS,
            );
        };

        const schedule = () => {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
        };

        const unsubscribe = store.subscribe((state, previous) => {
            if (
                state.content === previous.content &&
                state.design === previous.design &&
                state.template_key === previous.template_key
            ) {
                return;
            }
            dirty.current = true;
            if (!stopped.current) {
                setStatus('pending');
                schedule();
            }
        });

        // Save straight away when the tab is hidden or closed.
        const flush = () => {
            if (
                document.visibilityState === 'hidden' &&
                dirty.current &&
                !stopped.current
            ) {
                clearTimeout(timer.current);
                void save();
            }
        };
        const warn = (event: BeforeUnloadEvent) => {
            if (dirty.current || inFlight.current) {
                event.preventDefault();
            }
        };

        document.addEventListener('visibilitychange', flush);
        window.addEventListener('beforeunload', warn);

        return () => {
            unsubscribe();
            clearTimeout(timer.current);
            document.removeEventListener('visibilitychange', flush);
            window.removeEventListener('beforeunload', warn);
            if (dirty.current && !stopped.current) {
                void save();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, url]);

    return { status, error };
}
