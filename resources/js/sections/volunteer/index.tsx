import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'volunteer'>({
        title: 'role',
        subtitle: 'organization',
        meta: ['location'],
        body: 'description',
    }),
} satisfies SectionDefinition<'volunteer'>;
