import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'header',
    label: 'Header',
    description: 'Your name, title and contact details.',
    single: true,
    fields: [
        {
            key: 'name',
            label: 'Full name',
            kind: 'text',
            placeholder: 'Your Name',
        },
        {
            key: 'title',
            label: 'Professional title',
            kind: 'text',
            placeholder: 'Job Title',
            toggle: 'showTitle',
        },
        {
            key: 'email',
            label: 'Email',
            kind: 'email',
            placeholder: 'you@example.com',
        },
        {
            key: 'phone',
            label: 'Phone',
            kind: 'phone',
            placeholder: '+1 555 0100',
        },
        {
            key: 'location',
            label: 'Location',
            kind: 'text',
            placeholder: 'City, Country',
            toggle: 'showLocation',
        },
        {
            key: 'links',
            label: 'Links',
            kind: 'links',
            placeholder: 'yourwebsite.com',
            toggle: 'showLinks',
        },
        { key: 'photo', label: 'Photo', kind: 'photo', toggle: 'showPhoto' },
    ],
    settings: [
        { key: 'showPhoto', label: 'Photo', kind: 'toggle' },
        { key: 'showTitle', label: 'Title', kind: 'toggle' },
        { key: 'showLocation', label: 'Location', kind: 'toggle' },
        { key: 'showLinks', label: 'Links', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.name, item.title),
});
