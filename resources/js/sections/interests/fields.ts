import { defineFields } from '../define';

export default defineFields({
    type: 'interests',
    label: 'Interests',
    description: 'Hobbies and things you care about.',
    single: false,
    fields: [
        {
            key: 'name',
            label: 'Interest',
            kind: 'text',
            placeholder: 'Interest',
        },
        {
            key: 'keywords',
            label: 'Details',
            kind: 'keywords',
            placeholder: 'Detail',
            toggle: 'showKeywords',
        },
    ],
    settings: [{ key: 'showKeywords', label: 'Details', kind: 'toggle' }],
    summarize: (item) => item.name,
});
