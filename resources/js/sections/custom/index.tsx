import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'custom'>({
        title: 'title',
        subtitle: 'subtitle',
        meta: ['location', 'link'],
        body: 'description',
    }),
} satisfies SectionDefinition<'custom'>;
