import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'experience',
    label: 'Experience',
    description: 'Jobs and internships, most recent first.',
    single: false,
    fields: [
        {
            key: 'role',
            label: 'Job title',
            kind: 'text',
            placeholder: 'Job Title',
        },
        {
            key: 'company',
            label: 'Company',
            kind: 'text',
            placeholder: 'Company',
        },
        {
            key: 'location',
            label: 'Location',
            kind: 'text',
            placeholder: 'City',
            toggle: 'showLocation',
        },
        {
            key: 'link',
            label: 'Link',
            kind: 'url',
            placeholder: 'company.com',
            toggle: 'showLink',
        },
        {
            key: 'start',
            label: 'Start date',
            kind: 'date',
            placeholder: 'Start',
            toggle: 'showDates',
        },
        {
            key: 'end',
            label: 'End date',
            kind: 'date',
            placeholder: 'End',
            toggle: 'showDates',
        },
        {
            key: 'current',
            label: 'I work here now',
            kind: 'current',
            toggle: 'showDates',
        },
        {
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'What you did and what changed because of it.',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDates', label: 'Dates', kind: 'toggle' },
        { key: 'showLocation', label: 'Location', kind: 'toggle' },
        { key: 'showLink', label: 'Link', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.role, item.company),
});
