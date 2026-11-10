import { temporal } from 'zundo';
import { createStore } from 'zustand/vanilla';
import type {
    CoverLetterContent,
    DesignOverrides,
    DocumentType,
    ResumeContent,
    TemplateKey,
} from '@/schema';

/** The parts of a document that the editor changes and undo/redo tracks. */
export interface EditableDocument {
    type: DocumentType;
    template_key: TemplateKey;
    content: ResumeContent | CoverLetterContent;
    design: DesignOverrides;
}

export interface EditorState extends EditableDocument {
    /**
     * Apply a change. Changes that share a `group` key within
     * MERGE_WINDOW_MS of each other become one undo step (typing).
     */
    change: (patch: Partial<EditableDocument>, group?: string) => void;
}

export const MERGE_WINDOW_MS = 500;
export const HISTORY_LIMIT = 100;

type Tracked = Pick<EditorState, 'template_key' | 'content' | 'design'>;

type RecordHistory = (
    pastState: unknown,
    replace: unknown,
    currentState: unknown,
    deltaState: unknown,
) => void;

export function createEditorStore(initial: EditableDocument) {
    let pendingGroup: string | undefined;
    let lastGroup: string | undefined;
    let lastAt = 0;

    return createStore<EditorState>()(
        temporal(
            (set) => ({
                ...initial,
                change: (patch, group) => {
                    pendingGroup = group;
                    set(patch);
                    pendingGroup = undefined;
                },
            }),
            {
                limit: HISTORY_LIMIT,
                partialize: ({ template_key, content, design }): Tracked => ({
                    template_key,
                    content,
                    design,
                }),
                equality: (a, b) =>
                    a.template_key === b.template_key &&
                    a.content === b.content &&
                    a.design === b.design,
                // zundo passes its internal four-argument _handleSet here; its
                // published type claims setState, hence the cast.
                handleSet:
                    (setState) =>
                    (pastState, replace, currentState, deltaState) => {
                        const handleSet = setState as unknown as RecordHistory;
                        const now = Date.now();
                        const merge =
                            pendingGroup !== undefined &&
                            pendingGroup === lastGroup &&
                            now - lastAt < MERGE_WINDOW_MS;

                        lastGroup = pendingGroup;
                        lastAt = now;

                        if (!merge) {
                            handleSet(
                                pastState,
                                replace,
                                currentState,
                                deltaState,
                            );
                        }
                    },
            },
        ),
    );
}

export type EditorStore = ReturnType<typeof createEditorStore>;
