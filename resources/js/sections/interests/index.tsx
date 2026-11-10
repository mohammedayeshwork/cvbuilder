import { ItemScope } from '@/renderer/context';
import { Field, Keywords } from '@/renderer/primitives';
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
                                <Keywords
                                    className="cv-muted cv-interest-keywords"
                                    prefix={(text) => ` (${text})`}
                                />
                            </ItemScope>
                        </li>
                    ))}
                </ul>
            ),
        },
    ],
} satisfies SectionDefinition<'interests'>;
