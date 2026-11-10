import type { SectionType } from '@/schema';
import awards from './awards/fields';
import certifications from './certifications/fields';
import courses from './courses/fields';
import custom from './custom/fields';
import education from './education/fields';
import experience from './experience/fields';
import header from './header/fields';
import interests from './interests/fields';
import languages from './languages/fields';
import projects from './projects/fields';
import publications from './publications/fields';
import references from './references/fields';
import skills from './skills/fields';
import summary from './summary/fields';
import type { FieldDef, SectionFields } from './types';
import volunteer from './volunteer/fields';

/** Field metadata for every section type, without renderers. */
export const SECTION_FIELDS: { [T in SectionType]: SectionFields<T> } = {
    header,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    awards,
    volunteer,
    publications,
    courses,
    interests,
    references,
    custom,
};

export function fieldDef(type: SectionType, key: string): FieldDef | undefined {
    return (SECTION_FIELDS[type].fields as FieldDef[]).find(
        (field) => field.key === key,
    );
}
