import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Design, Section } from '@/schema';
import type { TemplateDefinition } from '@/templates/types';
import { useEdit } from './edit';

/**
 * edit: inline editing on the canvas (placeholders, toolbars)
 * view: read-only on screen (thumbnails, share page, preview)
 * print: what the PDF renders; never shows editing affordances
 */
export type RenderMode = 'edit' | 'view' | 'print';

export interface RenderContextValue {
    mode: RenderMode;
    design: Design;
    template: TemplateDefinition;
}

const RenderContext = createContext<RenderContextValue | null>(null);

export const RenderProvider = RenderContext.Provider;

export function useRender(): RenderContextValue {
    const value = useContext(RenderContext);

    if (!value) {
        throw new Error('useRender() must be used inside <DocumentRenderer>.');
    }

    return value;
}

type AnyItem = Section['items'][number];

interface ItemContextValue {
    section: Section;
    item: AnyItem;
}

const ItemContext = createContext<ItemContextValue | null>(null);

/**
 * Gives fields inside it access to one item of one section. In the editor
 * it also wraps the item in its hover controls.
 */
export function ItemScope({
    section,
    item,
    children,
}: ItemContextValue & { children: ReactNode }) {
    const render = useContext(RenderContext);
    const edit = useEdit();
    const framed = render?.mode === 'edit' && edit !== null;

    return (
        <ItemContext.Provider value={{ section, item }}>
            {framed ? <edit.ItemFrame>{children}</edit.ItemFrame> : children}
        </ItemContext.Provider>
    );
}

export function useItem(): ItemContextValue {
    const value = useContext(ItemContext);

    if (!value) {
        throw new Error('Fields must be rendered inside <ItemScope>.');
    }

    return value;
}
