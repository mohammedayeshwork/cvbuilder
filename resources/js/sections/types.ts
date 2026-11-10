import type { ReactNode } from 'react';
import type { ItemOf, SectionOf, SectionType, SettingsOf } from '@/schema';

export type FieldKind =
    | 'text'
    | 'rich'
    | 'date'
    | 'url'
    | 'email'
    | 'phone'
    | 'level'
    | 'keywords'
    | 'proficiency'
    | 'current'
    | 'links'
    | 'photo';

type Key<T> = Extract<keyof T, string>;

export interface FieldDef<T extends SectionType = SectionType> {
    key: Key<ItemOf<T>>;
    label: string;
    kind: FieldKind;
    placeholder?: string;
    /** Boolean setting that hides this field when off. */
    toggle?: Key<SettingsOf<T>>;
}

export type SettingDef<T extends SectionType = SectionType> =
    | { key: Key<SettingsOf<T>>; label: string; kind: 'toggle' }
    | {
          key: Key<SettingsOf<T>>;
          label: string;
          kind: 'select';
          options: { value: string; label: string }[];
      };

/** Field and setting metadata for a section type. Pure data, no components. */
export interface SectionFields<T extends SectionType = SectionType> {
    type: T;
    label: string;
    description: string;
    /** Holds exactly one item (header, summary). */
    single: boolean;
    fields: FieldDef<T>[];
    settings: SettingDef<T>[];
    /** One-line label for an item, e.g. "Senior Analyst, Harrow & Lane". */
    summarize: (item: ItemOf<T>) => string;
}

/** One unbreakable piece of a section, in reading order. Pagination never splits a block. */
export interface Block {
    key: string;
    node: ReactNode;
}

export interface SectionDefinition<
    T extends SectionType = SectionType,
> extends SectionFields<T> {
    /** The blocks that follow the section title. */
    blocks: (section: SectionOf<T>) => Block[];
}
