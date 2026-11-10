import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'references',
    label: 'References',
    description: 'People who can vouch for your work.',
    single: false,
    fields: [
        { key: 'name', label: 'Name', kind: 'text', placeholder: 'Full Name' },
        {
            key: 'title',
            label: 'Title',
            kind: 'text',
            placeholder: 'Their Title',
        },
        {
            key: 'company',
            label: 'Company',
            kind: 'text',
            placeholder: 'Company',
        },
        {
            key: 'relationship',
            label: 'Relationship',
            kind: 'text',
            placeholder: 'How you know them',
        },
        {
            key: 'email',
            label: 'Email',
            kind: 'email',
            placeholder: 'name@example.com',
            toggle: 'showContact',
        },
        {
            key: 'phone',
            label: 'Phone',
            kind: 'phone',
            placeholder: 'Phone',
            toggle: 'showContact',
        },
    ],
    settings: [
        {
            key: 'onRequestOnly',
            label: 'Show “Available on request” only',
            kind: 'toggle',
        },
        { key: 'showContact', label: 'Contact details', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.name, item.company),
});
