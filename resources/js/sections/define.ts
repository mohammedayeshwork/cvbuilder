import type { SectionType } from '@/schema';
import type { SectionFields } from './types';

export const defineFields = <T extends SectionType>(
    fields: SectionFields<T>,
): SectionFields<T> => fields;

/** Non-empty parts joined with ", ". */
export const joinParts = (...parts: (string | null | undefined)[]): string =>
    parts.filter((part) => part && part.trim() !== '').join(', ');
