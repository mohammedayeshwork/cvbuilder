import { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import type { EditorState, EditorStore } from './store';

const StoreContext = createContext<EditorStore | null>(null);

export const EditorStoreProvider = StoreContext.Provider;

export function useEditorStore(): EditorStore {
    const store = useContext(StoreContext);

    if (!store) {
        throw new Error('useEditorStore() must be used inside the editor.');
    }

    return store;
}

export function useEditor<T>(selector: (state: EditorState) => T): T {
    return useStore(useEditorStore(), selector);
}

export function useHistory() {
    const store = useEditorStore();
    const canUndo = useStore(
        store.temporal,
        (state) => state.pastStates.length > 0,
    );
    const canRedo = useStore(
        store.temporal,
        (state) => state.futureStates.length > 0,
    );

    return {
        canUndo,
        canRedo,
        undo: () => store.temporal.getState().undo(),
        redo: () => store.temporal.getState().redo(),
    };
}
