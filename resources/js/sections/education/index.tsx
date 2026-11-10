import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'education'>({
        title: 'degree',
        subtitle: 'institution',
        meta: ['location', 'grade'],
        body: 'description',
    }),
} satisfies SectionDefinition<'education'>;
