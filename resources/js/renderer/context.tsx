import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Design, Section } from '@/schema';
import type { TemplateDefinition } from '@/templates/types';

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

/** Gives fields inside it access to one item of one section. */
export function ItemScope({
    section,
    item,
    children,
}: ItemContextValue & { children: ReactNode }) {
    return (
        <ItemContext.Provider value={{ section, item }}>
            {children}
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
