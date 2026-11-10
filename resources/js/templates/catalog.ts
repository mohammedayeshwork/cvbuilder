import type { Column, SectionType, TemplateKey } from '@/schema';

export interface TemplateInfo {
    key: TemplateKey;
    name: string;
    description: string;
    layout: 'single' | 'two-column';
    /** Where each section type goes when a document starts on this template. */
    columns: Partial<Record<SectionType, Column>>;
}

const SIDEBAR: Partial<Record<SectionType, Column>> = {
    skills: 'side',
    languages: 'side',
    certifications: 'side',
    interests: 'side',
    awards: 'side',
    references: 'side',
};

/** Names and layout facts for every template, without their components. */
export const TEMPLATE_CATALOG: readonly TemplateInfo[] = [
    {
        key: 'classic',
        name: 'Classic',
        description: 'Serif type and thin rules. Calm and traditional.',
        layout: 'single',
        columns: {},
    },
    {
        key: 'modern-split',
        name: 'Modern Split',
        description: 'A tinted sidebar on the right for skills and languages.',
        layout: 'two-column',
        columns: SIDEBAR,
    },
    {
        key: 'bold-header',
        name: 'Bold Header',
        description: 'A full-width colored band with your name.',
        layout: 'single',
        columns: {},
    },
    {
        key: 'minimal',
        name: 'Minimal',
        description: 'Small-caps titles, no fills, lots of white space.',
        layout: 'single',
        columns: {},
    },
    {
        key: 'timeline',
        name: 'Timeline',
        description: 'Dots on a vertical rule for experience and education.',
        layout: 'single',
        columns: {},
    },
    {
        key: 'compact',
        name: 'Compact',
        description: 'Dense two columns that fit a lot on one page.',
        layout: 'two-column',
        columns: { ...SIDEBAR, education: 'side' },
    },
];

export const templateInfo = (key: string): TemplateInfo =>
    TEMPLATE_CATALOG.find((template) => template.key === key) ??
    TEMPLATE_CATALOG[0];
