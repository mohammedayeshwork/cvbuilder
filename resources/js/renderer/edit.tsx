import { createContext, useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { SECTION_SCHEMAS } from '@/schema';
import type { LanguageProficiency, Section, SectionType } from '@/schema';

export interface TextControlProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label: string;
    maxLength?: number;
    className?: string;
    field?: string;
    spellCheck?: boolean;
}

export interface RichControlProps {
    html: string;
    onChange: (html: string) => void;
    placeholder?: string;
    label: string;
    className?: string;
}

export interface KeywordsControlProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    label: string;
    className?: string;
}

/**
 * What the editor plugs into the renderer in edit mode. The renderer only
 * knows these interfaces, so view and print never load editor code paths.
 */
export interface EditBindings {
    setField: (
        sectionId: string,
        itemId: string,
        key: string,
        value: unknown,
    ) => void;
    setSectionTitle: (sectionId: string, title: string) => void;
    Text: ComponentType<TextControlProps>;
    Rich: ComponentType<RichControlProps>;
    Keywords: ComponentType<KeywordsControlProps>;
    /** Date or date range of the current item, with a picker. */
    Dates: ComponentType<{ className?: string }>;
    Level: ComponentType<{ level: number; onChange: (level: number) => void }>;
    Proficiency: ComponentType<{
        value: LanguageProficiency;
        onChange: (value: LanguageProficiency) => void;
        children: ReactNode;
    }>;
    /** Wraps every item: hover controls, drag handle. */
    ItemFrame: ComponentType<{ children: ReactNode }>;
    /** Wraps every section: toolbar, settings, add entry. */
    SectionFrame: ComponentType<{ section: Section; children: ReactNode }>;
}

const EditContext = createContext<EditBindings | null>(null);

export const EditProvider = EditContext.Provider;

/** The editor's bindings, or null outside the editor. */
export function useEdit(): EditBindings | null {
    return useContext(EditContext);
}

/** The schema's max length for a text field, so typing can never produce an invalid save. */
export function maxLengthOf(
    type: SectionType,
    key: string,
): number | undefined {
    const shape = SECTION_SCHEMAS[type].item.shape as Record<
        string,
        { maxLength?: number | null }
    >;

    return shape[key]?.maxLength ?? undefined;
}
