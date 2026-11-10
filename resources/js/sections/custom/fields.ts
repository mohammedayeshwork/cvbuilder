import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'custom',
    label: 'Custom Section',
    description: 'Anything else, with your own title.',
    single: false,
    fields: [
        { key: 'title', label: 'Title', kind: 'text', placeholder: 'Title' },
        {
            key: 'subtitle',
            label: 'Subtitle',
            kind: 'text',
            placeholder: 'Subtitle',
        },
        {
            key: 'location',
            label: 'Location',
            kind: 'text',
            placeholder: 'Location',
            toggle: 'showLocation',
        },
        {
            key: 'link',
            label: 'Link',
            kind: 'url',
            placeholder: 'link',
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
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'Description',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDates', label: 'Dates', kind: 'toggle' },
        { key: 'showLocation', label: 'Location', kind: 'toggle' },
        { key: 'showLink', label: 'Link', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.title, item.subtitle),
});
