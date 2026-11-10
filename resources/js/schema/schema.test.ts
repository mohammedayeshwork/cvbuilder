import { describe, expect, it } from 'vite-plus/test';
import meta from '../../schema/meta.json';
import {
    CoverLetterContent,
    DEFAULT_SETTINGS,
    DesignOverrides,
    emptyCoverLetter,
    emptyDesign,
    emptyResume,
    emptySection,
    migrate,
    ResumeContent,
    SECTION_SCHEMAS,
    SECTION_TYPES,
    TEMPLATE_KEYS,
} from '.';

const samples = import.meta.glob<{ content: unknown; design: unknown }>(
    '../../samples/*.json',
    { eager: true, import: 'default' },
);

describe('document schema', () => {
    it('accepts an empty resume, cover letter and design', () => {
        expect(ResumeContent.safeParse(emptyResume()).success).toBe(true);
        expect(CoverLetterContent.safeParse(emptyCoverLetter()).success).toBe(
            true,
        );
        expect(DesignOverrides.safeParse(emptyDesign()).success).toBe(true);
    });

    it('builds a valid empty section of every type', () => {
        for (const type of SECTION_TYPES) {
            const section = emptySection(type);

            expect(
                SECTION_SCHEMAS[type].section.safeParse(section).error,
            ).toBeUndefined();
            expect(section.settings).toEqual(DEFAULT_SETTINGS[type]);
        }
    });

    it('accepts every sample persona', () => {
        expect(Object.keys(samples)).toHaveLength(TEMPLATE_KEYS.length);

        for (const [path, sample] of Object.entries(samples)) {
            expect(
                ResumeContent.safeParse(sample.content).error,
                path,
            ).toBeUndefined();
            expect(
                DesignOverrides.safeParse(sample.design).error,
                path,
            ).toBeUndefined();
        }
    });

    it('rejects unsafe links and bad dates', () => {
        const resume = emptyResume();
        const experience = resume.sections.find(
            (s) => s.type === 'experience',
        )!;
        const item = experience.items[0] as {
            link: string;
            start: string | null;
        };

        for (const link of [
            'https://ok.example/x',
            'linkedin.com/in/me',
            'mailto:me@example.com',
            '',
        ]) {
            item.link = link;
            expect(ResumeContent.safeParse(resume).success, link).toBe(true);
        }

        for (const link of [
            'javascript:alert(1)',
            'data:text/html,x',
            'vbscript:x',
        ]) {
            item.link = link;
            expect(ResumeContent.safeParse(resume).success, link).toBe(false);
        }

        item.link = '';
        item.start = '2024-13';
        expect(ResumeContent.safeParse(resume).success).toBe(false);
    });

    it('keeps the exported metadata in sync', () => {
        expect(meta.templates).toEqual([...TEMPLATE_KEYS]);
        expect(meta.sectionTypes).toEqual(SECTION_TYPES);
        expect(meta.richTextKeys).toEqual(['body', 'description', 'text']);
    });
});

describe('migrate', () => {
    it('stamps the current version on documents without one', () => {
        expect(migrate('resume', { sections: [] })).toEqual({
            sections: [],
            version: 1,
        });
        expect(migrate('design', null)).toEqual({ version: 1 });
    });

    it('leaves current documents unchanged', () => {
        const resume = emptyResume();

        expect(migrate('resume', resume)).toEqual(resume);
    });
});
