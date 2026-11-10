import { defineFields } from '../define';

export default defineFields({
    type: 'skills',
    label: 'Skills',
    description: 'Tools, methods and strengths.',
    single: false,
    fields: [
        { key: 'name', label: 'Skill', kind: 'text', placeholder: 'Skill' },
        { key: 'level', label: 'Level', kind: 'level' },
        {
            key: 'keywords',
            label: 'Keywords',
            kind: 'keywords',
            placeholder: 'Keyword',
        },
    ],
    settings: [
        {
            key: 'display',
            label: 'Display',
            kind: 'select',
            options: [
                { value: 'tags', label: 'Tags' },
                { value: 'grouped', label: 'Grouped with keywords' },
                { value: 'bars', label: 'Level bars' },
            ],
        },
    ],
    summarize: (item) => item.name,
});
