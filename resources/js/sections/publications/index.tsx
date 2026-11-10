import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'publications'>({
        title: 'title',
        subtitle: 'publisher',
        meta: ['authors', 'link'],
        body: 'description',
    }),
} satisfies SectionDefinition<'publications'>;
