import type { ResumeContent } from '@/schema';
import { useEditorStore } from './context';

/** Apply a pure content operation through the store (one undo step, unless grouped). */
export function useApply() {
    const store = useEditorStore();

    return (fn: (content: ResumeContent) => ResumeContent, group?: string) =>
        store
            .getState()
            .change(
                { content: fn(store.getState().content as ResumeContent) },
                group,
            );
}

/** Focus the first editable field of an item once it is on the page. */
export function focusItem(itemId: string): void {
    requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>(
            `[data-item-id="${itemId}"] [contenteditable], [data-item-id="${itemId}"] .cv-rich-editable`,
        );
        field?.focus();
        field?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
}
