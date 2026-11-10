import { ItemScope } from '@/renderer/context';
import { Entry } from '@/renderer/primitives';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: (section) => {
        if (section.settings.onRequestOnly) {
            return [
                {
                    key: 'on-request',
                    node: <p className="cv-muted">Available on request.</p>,
                },
            ];
        }

        return section.items.map((item) => ({
            key: item.id,
            node: (
                <ItemScope section={section} item={item}>
                    <Entry
                        title="name"
                        subtitle="title"
                        meta={['company', 'relationship', 'email', 'phone']}
                    />
                </ItemScope>
            ),
        }));
    },
} satisfies SectionDefinition<'references'>;
