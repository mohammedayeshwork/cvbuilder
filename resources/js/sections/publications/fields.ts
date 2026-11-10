import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'publications',
    label: 'Publications',
    description: 'Papers, articles and books.',
    single: false,
    fields: [
        {
            key: 'title',
            label: 'Title',
            kind: 'text',
            placeholder: 'Publication Title',
        },
        {
            key: 'publisher',
            label: 'Publisher',
            kind: 'text',
            placeholder: 'Journal or Publisher',
            toggle: 'showPublisher',
        },
        {
            key: 'authors',
            label: 'Authors',
            kind: 'text',
            placeholder: 'Authors',
            toggle: 'showAuthors',
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
            placeholder: 'doi.org/…',
            toggle: 'showLink',
        },
        {
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'Summary',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDate', label: 'Date', kind: 'toggle' },
        { key: 'showPublisher', label: 'Publisher', kind: 'toggle' },
        { key: 'showAuthors', label: 'Authors', kind: 'toggle' },
        { key: 'showLink', label: 'Link', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.title, item.publisher),
});
