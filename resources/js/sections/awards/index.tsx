import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'awards'>({
        title: 'title',
        subtitle: 'issuer',
        body: 'description',
    }),
} satisfies SectionDefinition<'awards'>;
