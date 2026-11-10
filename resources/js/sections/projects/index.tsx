import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'projects'>({
        title: 'name',
        subtitle: 'role',
        meta: ['link'],
        body: 'description',
    }),
} satisfies SectionDefinition<'projects'>;
