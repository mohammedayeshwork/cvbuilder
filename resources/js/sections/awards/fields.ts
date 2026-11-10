import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'awards',
    label: 'Awards',
    description: 'Prizes, grants and recognition.',
    single: false,
    fields: [
        { key: 'title', label: 'Award', kind: 'text', placeholder: 'Award' },
        {
            key: 'issuer',
            label: 'Issuer',
            kind: 'text',
            placeholder: 'Awarded By',
            toggle: 'showIssuer',
        },
        {
            key: 'date',
            label: 'Date',
            kind: 'date',
            placeholder: 'Date',
            toggle: 'showDate',
        },
        {
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'What it was for',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDate', label: 'Date', kind: 'toggle' },
        { key: 'showIssuer', label: 'Issuer', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.title, item.issuer),
});
