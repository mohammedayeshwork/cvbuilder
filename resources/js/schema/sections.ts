import { z } from 'zod';
import {
    Column,
    Id,
    Keywords,
    PartialDate,
    PhotoSrc,
    RichText,
    Text,
    Url,
} from './common';

// ---------------------------------------------------------------- items

export const HeaderLink = z.strictObject({
    id: Id,
    label: Text(60),
    url: Url,
});

export const Photo = z.strictObject({
    src: PhotoSrc,
    shape: z.enum(['round', 'square']),
});

export const HeaderFields = {
    name: Text(120),
    title: Text(160),
    phone: Text(60),
    email: Text(254),
    location: Text(160),
    links: z.array(HeaderLink).max(10),
    photo: Photo.nullable(),
};

export const HeaderItem = z.strictObject({ id: Id, ...HeaderFields });

export const SummaryItem = z.strictObject({ id: Id, text: RichText });

export const ExperienceItem = z.strictObject({
    id: Id,
    role: Text(),
    company: Text(),
    location: Text(),
    link: Url,
    start: PartialDate,
    end: PartialDate,
    current: z.boolean(),
    description: RichText,
});

export const EducationItem = z.strictObject({
    id: Id,
    degree: Text(),
    institution: Text(),
    location: Text(),
    start: PartialDate,
    end: PartialDate,
    current: z.boolean(),
    grade: Text(80),
    description: RichText,
});

export const SkillItem = z.strictObject({
    id: Id,
    name: Text(80),
    level: z.int().min(0).max(5),
    keywords: Keywords,
});

export const ProjectItem = z.strictObject({
    id: Id,
    name: Text(),
    role: Text(),
    link: Url,
    start: PartialDate,
    end: PartialDate,
    description: RichText,
});

export const CertificationItem = z.strictObject({
    id: Id,
    name: Text(),
    issuer: Text(),
    date: PartialDate,
    link: Url,
    description: RichText,
});

export const LanguageProficiency = z.enum([
    'native',
    'fluent',
    'advanced',
    'intermediate',
    'basic',
]);

export const LanguageItem = z.strictObject({
    id: Id,
    name: Text(80),
    proficiency: LanguageProficiency,
});

export const AwardItem = z.strictObject({
    id: Id,
    title: Text(),
    issuer: Text(),
    date: PartialDate,
    description: RichText,
});

export const VolunteerItem = z.strictObject({
    id: Id,
    role: Text(),
    organization: Text(),
    location: Text(),
    start: PartialDate,
    end: PartialDate,
    current: z.boolean(),
    description: RichText,
});

export const PublicationItem = z.strictObject({
    id: Id,
    title: Text(300),
    publisher: Text(),
    authors: Text(300),
    date: PartialDate,
    link: Url,
    description: RichText,
});

export const CourseItem = z.strictObject({
    id: Id,
    name: Text(),
    institution: Text(),
    date: PartialDate,
    description: RichText,
});

export const InterestItem = z.strictObject({
    id: Id,
    name: Text(80),
    keywords: Keywords,
});

export const ReferenceItem = z.strictObject({
    id: Id,
    name: Text(120),
    title: Text(),
    company: Text(),
    email: Text(254),
    phone: Text(60),
    relationship: Text(),
});

export const CustomItem = z.strictObject({
    id: Id,
    title: Text(),
    subtitle: Text(),
    location: Text(),
    link: Url,
    start: PartialDate,
    end: PartialDate,
    description: RichText,
});

// ------------------------------------------------------------- settings

const flag = z.boolean();

export const HeaderSettings = z.strictObject({
    showPhoto: flag,
    showTitle: flag,
    showLinks: flag,
    showLocation: flag,
});
export const SummarySettings = z.strictObject({});
export const ExperienceSettings = z.strictObject({
    showDates: flag,
    showLocation: flag,
    showLink: flag,
    showDescription: flag,
});
export const EducationSettings = z.strictObject({
    showDates: flag,
    showLocation: flag,
    showGrade: flag,
    showDescription: flag,
});
export const SkillsSettings = z.strictObject({
    display: z.enum(['tags', 'grouped', 'bars']),
});
export const ProjectsSettings = z.strictObject({
    showDates: flag,
    showRole: flag,
    showLink: flag,
    showDescription: flag,
});
export const CertificationsSettings = z.strictObject({
    showDate: flag,
    showIssuer: flag,
    showLink: flag,
    showDescription: flag,
});
export const LanguagesSettings = z.strictObject({
    display: z.enum(['text', 'dots', 'bars']),
});
export const AwardsSettings = z.strictObject({
    showDate: flag,
    showIssuer: flag,
    showDescription: flag,
});
export const VolunteerSettings = z.strictObject({
    showDates: flag,
    showLocation: flag,
    showDescription: flag,
});
export const PublicationsSettings = z.strictObject({
    showDate: flag,
    showPublisher: flag,
    showAuthors: flag,
    showLink: flag,
    showDescription: flag,
});
export const CoursesSettings = z.strictObject({
    showDate: flag,
    showInstitution: flag,
    showDescription: flag,
});
export const InterestsSettings = z.strictObject({
    showKeywords: flag,
});
export const ReferencesSettings = z.strictObject({
    onRequestOnly: flag,
    showContact: flag,
});
export const CustomSettings = z.strictObject({
    showDates: flag,
    showLocation: flag,
    showLink: flag,
    showDescription: flag,
});

// ------------------------------------------------------------- sections

function section<T extends string, I extends z.ZodType, S extends z.ZodType>(
    type: T,
    item: I,
    settings: S,
    items: { min?: number; max: number },
) {
    let list = z.array(item).max(items.max);

    if (items.min !== undefined) {
        list = list.min(items.min);
    }

    return z.strictObject({
        id: Id,
        type: z.literal(type),
        title: Text(80),
        column: Column,
        pageBreakBefore: z.boolean(),
        settings,
        items: list,
    });
}

const many = { max: 60 };

export const HeaderSection = section('header', HeaderItem, HeaderSettings, {
    min: 1,
    max: 1,
});
export const SummarySection = section('summary', SummaryItem, SummarySettings, {
    min: 1,
    max: 1,
});
export const ExperienceSection = section(
    'experience',
    ExperienceItem,
    ExperienceSettings,
    many,
);
export const EducationSection = section(
    'education',
    EducationItem,
    EducationSettings,
    many,
);
export const SkillsSection = section('skills', SkillItem, SkillsSettings, many);
export const ProjectsSection = section(
    'projects',
    ProjectItem,
    ProjectsSettings,
    many,
);
export const CertificationsSection = section(
    'certifications',
    CertificationItem,
    CertificationsSettings,
    many,
);
export const LanguagesSection = section(
    'languages',
    LanguageItem,
    LanguagesSettings,
    many,
);
export const AwardsSection = section('awards', AwardItem, AwardsSettings, many);
export const VolunteerSection = section(
    'volunteer',
    VolunteerItem,
    VolunteerSettings,
    many,
);
export const PublicationsSection = section(
    'publications',
    PublicationItem,
    PublicationsSettings,
    many,
);
export const CoursesSection = section(
    'courses',
    CourseItem,
    CoursesSettings,
    many,
);
export const InterestsSection = section(
    'interests',
    InterestItem,
    InterestsSettings,
    many,
);
export const ReferencesSection = section(
    'references',
    ReferenceItem,
    ReferencesSettings,
    many,
);
export const CustomSection = section(
    'custom',
    CustomItem,
    CustomSettings,
    many,
);

/** Every section type with its item and settings schemas. */
export const SECTION_SCHEMAS = {
    header: {
        section: HeaderSection,
        item: HeaderItem,
        settings: HeaderSettings,
    },
    summary: {
        section: SummarySection,
        item: SummaryItem,
        settings: SummarySettings,
    },
    experience: {
        section: ExperienceSection,
        item: ExperienceItem,
        settings: ExperienceSettings,
    },
    education: {
        section: EducationSection,
        item: EducationItem,
        settings: EducationSettings,
    },
    skills: {
        section: SkillsSection,
        item: SkillItem,
        settings: SkillsSettings,
    },
    projects: {
        section: ProjectsSection,
        item: ProjectItem,
        settings: ProjectsSettings,
    },
    certifications: {
        section: CertificationsSection,
        item: CertificationItem,
        settings: CertificationsSettings,
    },
    languages: {
        section: LanguagesSection,
        item: LanguageItem,
        settings: LanguagesSettings,
    },
    awards: {
        section: AwardsSection,
        item: AwardItem,
        settings: AwardsSettings,
    },
    volunteer: {
        section: VolunteerSection,
        item: VolunteerItem,
        settings: VolunteerSettings,
    },
    publications: {
        section: PublicationsSection,
        item: PublicationItem,
        settings: PublicationsSettings,
    },
    courses: {
        section: CoursesSection,
        item: CourseItem,
        settings: CoursesSettings,
    },
    interests: {
        section: InterestsSection,
        item: InterestItem,
        settings: InterestsSettings,
    },
    references: {
        section: ReferencesSection,
        item: ReferenceItem,
        settings: ReferencesSettings,
    },
    custom: {
        section: CustomSection,
        item: CustomItem,
        settings: CustomSettings,
    },
} as const;

export type SectionType = keyof typeof SECTION_SCHEMAS;

export const SECTION_TYPES = Object.keys(SECTION_SCHEMAS) as SectionType[];

export const Section = z.discriminatedUnion('type', [
    HeaderSection,
    SummarySection,
    ExperienceSection,
    EducationSection,
    SkillsSection,
    ProjectsSection,
    CertificationsSection,
    LanguagesSection,
    AwardsSection,
    VolunteerSection,
    PublicationsSection,
    CoursesSection,
    InterestsSection,
    ReferencesSection,
    CustomSection,
]);

export type Section = z.infer<typeof Section>;
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>;
export type ItemOf<T extends SectionType> = SectionOf<T>['items'][number];
export type SettingsOf<T extends SectionType> = SectionOf<T>['settings'];

export type HeaderItem = z.infer<typeof HeaderItem>;
export type HeaderFields = Omit<HeaderItem, 'id'>;
export type HeaderLink = z.infer<typeof HeaderLink>;
export type Photo = z.infer<typeof Photo>;
export type LanguageProficiency = z.infer<typeof LanguageProficiency>;
