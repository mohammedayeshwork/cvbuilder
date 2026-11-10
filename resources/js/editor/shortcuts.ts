import { useEffect } from 'react';
import type { EditorStore } from './store';

/** Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo. Form inputs keep their own undo. */
export function useUndoShortcuts(store: EditorStore): void {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;

            if (
                !(event.ctrlKey || event.metaKey) ||
                target.closest('input, textarea, select')
            ) {
                return;
            }

            const key = event.key.toLowerCase();
            const { undo, redo } = store.temporal.getState();

            if (key === 'z' && !event.shiftKey) {
                event.preventDefault();
                undo();
            } else if ((key === 'z' && event.shiftKey) || key === 'y') {
                event.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [store]);
}
