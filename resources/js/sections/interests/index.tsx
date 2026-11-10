import { ItemScope } from '@/renderer/context';
import { Field } from '@/renderer/primitives';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: (section) => [
        {
            key: 'list',
            node: (
                <ul className="cv-inline-list">
                    {section.items.map((item) => (
                        <li key={item.id}>
                            <ItemScope section={section} item={item}>
                                <Field name="name" />
                                {section.settings.showKeywords &&
                                    item.keywords.length > 0 && (
                                        <span className="cv-muted">
                                            {' '}
                                            ({item.keywords.join(', ')})
                                        </span>
                                    )}
                            </ItemScope>
                        </li>
                    ))}
                </ul>
            ),
        },
    ],
} satisfies SectionDefinition<'interests'>;
