import type { LanguageProficiency } from '@/schema';
import { defineFields } from '../define';

export const PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
    native: 'Native',
    fluent: 'Fluent',
    advanced: 'Advanced',
    intermediate: 'Intermediate',
    basic: 'Basic',
};

/** Proficiency on a 1–5 scale for dots and bars. */
export const PROFICIENCY_LEVELS: Record<LanguageProficiency, number> = {
    native: 5,
    fluent: 4,
    advanced: 3,
    intermediate: 2,
    basic: 1,
};

export default defineFields({
    type: 'languages',
    label: 'Languages',
    description: 'Languages you speak and how well.',
    single: false,
    fields: [
        {
            key: 'name',
            label: 'Language',
            kind: 'text',
            placeholder: 'Language',
        },
        { key: 'proficiency', label: 'Proficiency', kind: 'proficiency' },
    ],
    settings: [
        {
            key: 'display',
            label: 'Display',
            kind: 'select',
            options: [
                { value: 'text', label: 'Text' },
                { value: 'dots', label: 'Dots' },
                { value: 'bars', label: 'Bars' },
            ],
        },
    ],
    summarize: (item) => item.name,
});
