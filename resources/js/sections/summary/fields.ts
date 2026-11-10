import { defineFields } from '../define';

export default defineFields({
    type: 'summary',
    label: 'Summary',
    description: 'A short introduction at the top of your resume.',
    single: true,
    fields: [
        {
            key: 'text',
            label: 'Summary',
            kind: 'rich',
            placeholder:
                'Two or three sentences about your experience, strengths and what you are looking for.',
        },
    ],
    settings: [],
    summarize: (item) =>
        item.text
            .replace(/<[^>]*>/g, ' ')
            .trim()
            .slice(0, 60),
});
