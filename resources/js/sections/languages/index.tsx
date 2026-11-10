import { ItemScope } from '@/renderer/context';
import { Dots, Field, Meter } from '@/renderer/primitives';
import type { SectionDefinition } from '../types';
import fields, { PROFICIENCY_LABELS, PROFICIENCY_LEVELS } from './fields';

/** All languages form one block: short lists read better kept together. */
export default {
    ...fields,
    blocks: (section) => {
        const { display } = section.settings;

        if (display === 'text') {
            return [
                {
                    key: 'list',
                    node: (
                        <ul className="cv-inline-list">
                            {section.items.map((item) => (
                                <li key={item.id}>
                                    <ItemScope section={section} item={item}>
                                        <Field name="name" />
                                        <span className="cv-rated-label">
                                            {
                                                PROFICIENCY_LABELS[
                                                    item.proficiency
                                                ]
                                            }
                                        </span>
                                    </ItemScope>
                                </li>
                            ))}
                        </ul>
                    ),
                },
            ];
        }

        return [
            {
                key: 'grid',
                node: (
                    <ul className="cv-rated-grid">
                        {section.items.map((item) => {
                            const label = PROFICIENCY_LABELS[item.proficiency];
                            const level = PROFICIENCY_LEVELS[item.proficiency];

                            return (
                                <li key={item.id} className="cv-rated">
                                    <ItemScope section={section} item={item}>
                                        <Field
                                            name="name"
                                            className="cv-rated-name"
                                        />
                                        {display === 'dots' ? (
                                            <Dots level={level} label={label} />
                                        ) : (
                                            <Meter
                                                level={level}
                                                label={label}
                                            />
                                        )}
                                    </ItemScope>
                                </li>
                            );
                        })}
                    </ul>
                ),
            },
        ];
    },
} satisfies SectionDefinition<'languages'>;
