import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'volunteer',
    label: 'Volunteering',
    description: 'Unpaid roles and community work.',
    single: false,
    fields: [
        { key: 'role', label: 'Role', kind: 'text', placeholder: 'Role' },
        {
            key: 'organization',
            label: 'Organization',
            kind: 'text',
            placeholder: 'Organization',
        },
        {
            key: 'location',
            label: 'Location',
            kind: 'text',
            placeholder: 'City',
            toggle: 'showLocation',
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
            label: 'Ongoing',
            kind: 'current',
            toggle: 'showDates',
        },
        {
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'What you did',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDates', label: 'Dates', kind: 'toggle' },
        { key: 'showLocation', label: 'Location', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.role, item.organization),
});
