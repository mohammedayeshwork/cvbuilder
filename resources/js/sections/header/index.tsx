import type { SectionDefinition } from '../types';
import fields from './fields';

/** The header is drawn by each template's Header component, not as blocks. */
export default {
    ...fields,
    blocks: () => [],
} satisfies SectionDefinition<'header'>;
