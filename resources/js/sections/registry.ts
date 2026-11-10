import type { Section, SectionType } from '@/schema';
import awards from './awards';
import certifications from './certifications';
import courses from './courses';
import custom from './custom';
import education from './education';
import experience from './experience';
import header from './header';
import interests from './interests';
import languages from './languages';
import projects from './projects';
import publications from './publications';
import references from './references';
import skills from './skills';
import summary from './summary';
import type { Block, SectionDefinition } from './types';
import volunteer from './volunteer';

/** Every section type: fields, settings and block renderer. */
export const SECTIONS: { [T in SectionType]: SectionDefinition<T> } = {
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

export function sectionBlocks(section: Section): Block[] {
    return (SECTIONS[section.type] as SectionDefinition).blocks(
        section as never,
    );
}
