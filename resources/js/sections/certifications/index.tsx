import { entryBlocks } from '../entry';
import type { SectionDefinition } from '../types';
import fields from './fields';

export default {
    ...fields,
    blocks: entryBlocks<'certifications'>({
        title: 'name',
        subtitle: 'issuer',
        meta: ['link'],
        body: 'description',
    }),
} satisfies SectionDefinition<'certifications'>;
