import { ItemScope } from '@/renderer/context';
import { Field, Keywords, LevelMeter } from '@/renderer/primitives';
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
                                <li key={item.id}>
                                    <ItemScope section={section} item={item}>
                                        <div className="cv-rated">
                                            <Field
                                                name="name"
                                                className="cv-rated-name"
                                            />
                                            <LevelMeter />
                                        </div>
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
                        <Keywords className="cv-skill-keywords" />
                    </div>
                </ItemScope>
            ),
        }));
    },
} satisfies SectionDefinition<'skills'>;
