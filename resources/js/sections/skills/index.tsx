import { ItemScope } from '@/renderer/context';
import { Field, Meter } from '@/renderer/primitives';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: (section) => {
        const { display } = section.settings;

        if (display === 'tags') {
            return [
                {
                    key: 'tags',
                    node: (
                        <ul className="cv-tags">
                            {section.items.map((item) => (
                                <li key={item.id} className="cv-tag">
                                    <ItemScope section={section} item={item}>
                                        <Field name="name" />
                                    </ItemScope>
                                </li>
                            ))}
                        </ul>
                    ),
                },
            ];
        }

        if (display === 'bars') {
            return [
                {
                    key: 'bars',
                    node: (
                        <ul className="cv-rated-grid">
                            {section.items.map((item) => (
                                <li key={item.id} className="cv-rated">
                                    <ItemScope section={section} item={item}>
                                        <Field
                                            name="name"
                                            className="cv-rated-name"
                                        />
                                        <Meter
                                            level={item.level}
                                            label={`${item.level} out of 5`}
                                        />
                                    </ItemScope>
                                </li>
                            ))}
                        </ul>
                    ),
                },
            ];
        }

        return section.items.map((item) => ({
            key: item.id,
            node: (
                <ItemScope section={section} item={item}>
                    <div className="cv-skill-group">
                        <Field name="name" className="cv-skill-name" />
                        {item.keywords.length > 0 && (
                            <span className="cv-skill-keywords">
                                {item.keywords.join(', ')}
                            </span>
                        )}
                    </div>
                </ItemScope>
            ),
        }));
    },
} satisfies SectionDefinition<'skills'>;
