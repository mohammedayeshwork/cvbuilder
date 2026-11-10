import { defineFields, joinParts } from '../define';

export default defineFields({
    type: 'education',
    label: 'Education',
    description: 'Degrees, diplomas and schools.',
    single: false,
    fields: [
        {
            key: 'degree',
            label: 'Degree',
            kind: 'text',
            placeholder: 'Degree or Field of Study',
        },
        {
            key: 'institution',
            label: 'School',
            kind: 'text',
            placeholder: 'School or University',
        },
        {
            key: 'location',
            label: 'Location',
            kind: 'text',
            placeholder: 'City',
            toggle: 'showLocation',
        },
        {
            key: 'grade',
            label: 'Grade',
            kind: 'text',
            placeholder: 'Grade',
            toggle: 'showGrade',
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
            label: 'I study here now',
            kind: 'current',
            toggle: 'showDates',
        },
        {
            key: 'description',
            label: 'Description',
            kind: 'rich',
            placeholder: 'Thesis, honours or relevant courses.',
            toggle: 'showDescription',
        },
    ],
    settings: [
        { key: 'showDates', label: 'Dates', kind: 'toggle' },
        { key: 'showLocation', label: 'Location', kind: 'toggle' },
        { key: 'showGrade', label: 'Grade', kind: 'toggle' },
        { key: 'showDescription', label: 'Description', kind: 'toggle' },
    ],
    summarize: (item) => joinParts(item.degree, item.institution),
});
