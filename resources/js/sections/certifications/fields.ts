import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'certifications',
    label: 'Certifications',
    description: 'Licences and professional certificates.',
    single: false,
    fields: [
        {
            key: 'name',
            label: 'Certification',
            kind: 'text',
            placeholder: 'Certification',
        },
        {
            key: 'issuer',
            label: 'Issuer',
            kind: 'text',
            placeholder: 'Issuing Organization',
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
            key: 'link',
            label: 'Link',
            kind: 'url',
            placeholder: 'credential link',
            toggle: 'showLink',
        },
        {
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'Details',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDate', label: 'Date', kind: 'toggle' },
        { key: 'showIssuer', label: 'Issuer', kind: 'toggle' },
        { key: 'showLink', label: 'Link', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.name, item.issuer),
});
