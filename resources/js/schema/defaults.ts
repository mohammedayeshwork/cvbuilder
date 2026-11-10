import { nanoid } from 'nanoid';
import type { Column } from './common';
import { COVER_LETTER_VERSION } from './cover-letter';
import type { CoverLetterContent } from './cover-letter';
import { DESIGN_VERSION } from './design';
import type { DesignOverrides } from './design';
import { RESUME_VERSION } from './resume';
import type { ResumeContent } from './resume';
import type {
    HeaderFields,
    ItemOf,
    SectionOf,
    SectionType,
    SettingsOf,
} from './sections';

export const newId = (): string => nanoid(10);

export const DEFAULT_TITLES: Record<SectionType, string> = {
    header: 'Header',
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    languages: 'Languages',
    awards: 'Awards',
    volunteer: 'Volunteering',
    publications: 'Publications',
    courses: 'Courses',
    interests: 'Interests',
    references: 'References',
    custom: 'Custom Section',
};

export const DEFAULT_SETTINGS: { [T in SectionType]: SettingsOf<T> } = {
    header: {
        showPhoto: true,
        showTitle: true,
        showLinks: true,
        showLocation: true,
    },
    summary: {},
    experience: {
        showDates: true,
        showLocation: true,
        showLink: true,
        showDescription: true,
    },
    education: {
        showDates: true,
        showLocation: true,
        showGrade: true,
        showDescription: true,
    },
    skills: { display: 'tags' },
    projects: {
        showDates: true,
        showRole: true,
        showLink: true,
        showDescription: true,
    },
    certifications: {
        showDate: true,
        showIssuer: true,
        showLink: true,
        showDescription: true,
    },
    languages: { display: 'text' },
    awards: { showDate: true, showIssuer: true, showDescription: true },
    volunteer: { showDates: true, showLocation: true, showDescription: true },
    publications: {
        showDate: true,
        showPublisher: true,
        showAuthors: true,
        showLink: true,
        showDescription: true,
    },
    courses: { showDate: true, showInstitution: true, showDescription: true },
    interests: { showKeywords: true },
    references: { onRequestOnly: false, showContact: true },
    custom: {
        showDates: true,
        showLocation: true,
        showLink: true,
        showDescription: true,
    },
};

export const emptyHeaderFields = (): HeaderFields => ({
    name: '',
    title: '',
    phone: '',
    email: '',
    location: '',
    links: [],
    photo: null,
});

type ItemFactories = { [T in SectionType]: () => Omit<ItemOf<T>, 'id'> };

const ITEM_FACTORIES: ItemFactories = {
    header: emptyHeaderFields,
    summary: () => ({ text: '' }),
    experience: () => ({
        role: '',
        company: '',
        location: '',
        link: '',
        start: null,
        end: null,
        current: false,
        description: '',
    }),
    education: () => ({
        degree: '',
        institution: '',
        location: '',
        start: null,
        end: null,
        current: false,
        grade: '',
        description: '',
    }),
    skills: () => ({ name: '', level: 3, keywords: [] }),
    projects: () => ({
        name: '',
        role: '',
        link: '',
        start: null,
        end: null,
        description: '',
    }),
    certifications: () => ({
        name: '',
        issuer: '',
        date: null,
        link: '',
        description: '',
    }),
    languages: () => ({ name: '', proficiency: 'fluent' }),
    awards: () => ({ title: '', issuer: '', date: null, description: '' }),
    volunteer: () => ({
        role: '',
        organization: '',
        location: '',
        start: null,
        end: null,
        current: false,
        description: '',
    }),
    publications: () => ({
        title: '',
        publisher: '',
        authors: '',
        date: null,
        link: '',
        description: '',
    }),
    courses: () => ({ name: '', institution: '', date: null, description: '' }),
    interests: () => ({ name: '', keywords: [] }),
    references: () => ({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        relationship: '',
    }),
    custom: () => ({
        title: '',
        subtitle: '',
        location: '',
        link: '',
        start: null,
        end: null,
        description: '',
    }),
};

/** Sections that always hold exactly one item. */
export const SINGLE_ITEM_TYPES: readonly SectionType[] = ['header', 'summary'];

export function emptyItem<T extends SectionType>(type: T): ItemOf<T> {
    return { id: newId(), ...ITEM_FACTORIES[type]() } as unknown as ItemOf<T>;
}

export function emptySection<T extends SectionType>(
    type: T,
    column: Column = 'main',
): SectionOf<T> {
    return {
        id: newId(),
        type,
        title: DEFAULT_TITLES[type],
        column,
        pageBreakBefore: false,
        settings: structuredClone(DEFAULT_SETTINGS[type]),
        items: [emptyItem(type)],
    } as unknown as SectionOf<T>;
}

/** Sections a new resume starts with. */
export const STARTER_SECTIONS: readonly SectionType[] = [
    'header',
    'summary',
    'experience',
    'education',
    'skills',
];

export function emptyResume(
    columns: Partial<Record<SectionType, Column>> = {},
): ResumeContent {
    return {
        version: RESUME_VERSION,
        sections: STARTER_SECTIONS.map((type) =>
            emptySection(type, columns[type] ?? 'main'),
        ),
    };
}

export function emptyCoverLetter(
    sender: HeaderFields = emptyHeaderFields(),
): CoverLetterContent {
    return {
        version: COVER_LETTER_VERSION,
        sender,
        date: new Date().toISOString().slice(0, 10),
        recipient: { name: '', title: '', company: '', address: '' },
        greeting: 'Dear Hiring Manager,',
        body: '',
        closing: 'Sincerely,',
        signature: sender.name,
    };
}

export const emptyDesign = (): DesignOverrides => ({ version: DESIGN_VERSION });
