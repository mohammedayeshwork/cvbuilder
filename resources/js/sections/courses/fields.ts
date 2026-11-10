import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'courses',
    label: 'Courses',
    description: 'Training and courses you completed or taught.',
    single: false,
    fields: [
        {
            key: 'name',
            label: 'Course',
            kind: 'text',
            placeholder: 'Course Name',
        },
        {
            key: 'institution',
            label: 'Provider',
            kind: 'text',
            placeholder: 'Provider',
            toggle: 'showInstitution',
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
            placeholder: 'Details',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDate', label: 'Date', kind: 'toggle' },
        { key: 'showInstitution', label: 'Provider', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.name, item.institution),
});
