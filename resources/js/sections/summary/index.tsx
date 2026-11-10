import { ItemScope } from '@/renderer/context';
import { Field } from '@/renderer/primitives';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: (section) =>
        section.items.map((item) => ({
            key: item.id,
            node: (
                <ItemScope section={section} item={item}>
                    <Field name="text" className="cv-summary" />
                </ItemScope>
            ),
        })),
} satisfies SectionDefinition<'summary'>;
