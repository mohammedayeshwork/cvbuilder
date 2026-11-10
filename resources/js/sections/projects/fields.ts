import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'projects',
    label: 'Projects',
    description: 'Side projects, open source and notable work.',
    single: false,
    fields: [
        {
            key: 'name',
            label: 'Project',
            kind: 'text',
            placeholder: 'Project Name',
        },
        {
            key: 'role',
            label: 'Your role',
            kind: 'text',
            placeholder: 'Your Role',
            toggle: 'showRole',
        },
        {
            key: 'link',
            label: 'Link',
            kind: 'url',
            placeholder: 'project.com',
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
            placeholder: 'What it is, what you built and the result.',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDates', label: 'Dates', kind: 'toggle' },
        { key: 'showRole', label: 'Role', kind: 'toggle' },
        { key: 'showLink', label: 'Link', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.name, item.role),
});
