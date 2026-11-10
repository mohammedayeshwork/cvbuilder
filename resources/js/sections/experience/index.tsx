import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'experience'>({
        title: 'role',
        subtitle: 'company',
        meta: ['location', 'link'],
        body: 'description',
    }),
} satisfies SectionDefinition<'experience'>;
