import type { ComponentProps } from 'react';
import { ItemScope } from '@/renderer/context';
import { Entry } from '@/renderer/primitives';
import type { SectionOf, SectionType } from '@/schema';
import type { Block } from './types';

/** Blocks for sections whose items all use the shared Entry layout. */
export const entryBlocks =
    <T extends SectionType>(
        slots: Omit<ComponentProps<typeof Entry>, 'children'>,
    ) =>
    (section: SectionOf<T>): Block[] =>
        (section.items as SectionOf<T>['items'][number][]).map((item) => ({
            key: item.id,
            node: (
                <ItemScope section={section} item={item}>
                    <Entry {...slots} />
                </ItemScope>
            ),
        }));
