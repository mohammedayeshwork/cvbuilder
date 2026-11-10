import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'courses'>({
        title: 'name',
        subtitle: 'institution',
        body: 'description',
    }),
} satisfies SectionDefinition<'courses'>;
