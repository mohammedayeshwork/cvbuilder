// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
    emptyDesign,
    emptyResume,
    SECTION_SCHEMAS,
    SECTION_TYPES,
} from '@/schema';
import type { ResumeContent } from '@/schema';
import { SECTION_FIELDS } from '@/sections/fields';
import { PROFICIENCY_LABELS } from '@/sections/languages/fields';
import { DocumentRenderer } from './DocumentRenderer';
import { displayUrl, formatPartialDate } from './format';

const samples = import.meta.glob<{
    template_key: string;
    content: ResumeContent;
}>('../../samples/*.json', {
    eager: true,
    import: 'default',
});

afterEach(cleanup);

const renderResume = (
    content: ResumeContent,
    mode: 'view' | 'edit' | 'print' = 'view',
    template = 'classic',
) =>
    render(
        <DocumentRenderer
            document={{
                type: 'resume',
                template_key: template,
                content,
                design: emptyDesign(),
            }}
            mode={mode}
        />,
    );

/** The text runs between tags. */
const runs = (html: string) =>
    html
        .split(/<[^>]+>/)
        .map((run) => run.replace(/&amp;/g, '&').trim())
        .filter(Boolean);

const plain = (html: string) => runs(html).join(' ');

/** Every piece of text a sample should show, given its section settings. */
function expectedTexts(content: ResumeContent): string[] {
    const texts: string[] = [];

    for (const section of content.sections) {
        if (section.type !== 'header') {
            texts.push(section.title);
        }
        if (section.type === 'references' && section.settings.onRequestOnly) {
            continue;
        }
        const settings = section.settings as Record<string, unknown>;

        for (const item of section.items as Record<string, unknown>[]) {
            for (const field of SECTION_FIELDS[section.type].fields) {
                const value = item[field.key];
                if (field.toggle && settings[field.toggle] === false) continue;

                if (field.kind === 'date' && typeof value === 'string')
                    texts.push(formatPartialDate(value, 'MMM YYYY'));
                else if (
                    field.kind === 'url' &&
                    typeof value === 'string' &&
                    value
                )
                    texts.push(displayUrl(value));
                else if (field.kind === 'rich' && typeof value === 'string')
                    texts.push(...runs(value));
                else if (
                    field.kind === 'proficiency' &&
                    section.settings &&
                    settings.display === 'text'
                )
                    texts.push(
                        PROFICIENCY_LABELS[
                            value as keyof typeof PROFICIENCY_LABELS
                        ],
                    );
                else if (
                    field.kind === 'keywords' &&
                    Array.isArray(value) &&
                    section.type === 'skills' &&
                    settings.display === 'grouped'
                )
                    texts.push(...(value as string[]));
                else if (field.kind === 'links' && Array.isArray(value))
                    texts.push(
                        ...(value as { label: string }[]).map(
                            (link) => link.label,
                        ),
                    );
                else if (
                    ['text', 'email', 'phone'].includes(field.kind) &&
                    typeof value === 'string'
                )
                    texts.push(value);
            }
        }
    }

    return texts.filter((text) => text.trim() !== '');
}

describe('DocumentRenderer', () => {
    it.each(Object.entries(samples))('shows every field of %s', (_, sample) => {
        const { container } = renderResume(sample.content);
        const text = container.textContent!.replace(/\s+/g, ' ');

        for (const expected of expectedTexts(sample.content)) {
            expect(text).toContain(expected.replace(/\s+/g, ' '));
        }
    });

    it('hides fields whose setting is off', () => {
        const content = structuredClone(Object.values(samples)[0].content);
        const experience = content.sections.find(
            (s) => s.type === 'experience',
        )!;
        Object.assign(experience.settings, {
            showLocation: false,
            showDescription: false,
        });
        const first = experience.items[0] as {
            location: string;
            description: string;
        };

        const { container } = renderResume(content);

        expect(container.textContent).not.toContain(
            plain(first.description).slice(0, 30),
        );
        expect(
            container.querySelector(
                `[data-section-id="${experience.id}"] [data-field="location"]`,
            ),
        ).toBeNull();
    });

    it('leaves out empty sections and entries outside the editor', () => {
        const { container } = renderResume(emptyResume());

        expect(container.querySelectorAll('.cv-section')).toHaveLength(0);
        expect(container.querySelector('.cv-placeholder')).toBeNull();
    });

    it('shows placeholders for empty fields in the editor', () => {
        const { container } = renderResume(emptyResume(), 'edit');

        expect(
            container.querySelectorAll('.cv-section').length,
        ).toBeGreaterThanOrEqual(4);
        expect(container.textContent).toContain('Your Name');
        expect(container.textContent).toContain('Job Title');
    });

    it('never renders editing placeholders when printing', () => {
        for (const sample of Object.values(samples)) {
            const { container, unmount } = renderResume(
                sample.content,
                'print',
            );
            expect(container.querySelector('.cv-placeholder')).toBeNull();
            unmount();
        }
    });

    it('turns scheme-less links into https links', () => {
        const sample = Object.values(samples).find(
            (s) => s.template_key === 'minimal',
        )!;
        const { container } = renderResume(sample.content);
        const hrefs = [...container.querySelectorAll('a')].map((a) =>
            a.getAttribute('href'),
        );

        expect(hrefs).toContain('https://github.com/hanasato/pgdiff-lite');
        expect(hrefs.every((href) => /^(https:|mailto:)/.test(href!))).toBe(
            true,
        );
    });
});

describe('section registry', () => {
    it('describes every item key of every section type', () => {
        for (const type of SECTION_TYPES) {
            const schemaKeys = Object.keys(SECTION_SCHEMAS[type].item.shape)
                .filter((key) => key !== 'id')
                .sort();
            const fieldKeys = SECTION_FIELDS[type].fields
                .map((field) => field.key as string)
                .sort();

            expect(fieldKeys, type).toEqual(schemaKeys);
        }
    });

    it('describes every setting of every section type', () => {
        for (const type of SECTION_TYPES) {
            const schemaKeys = Object.keys(
                SECTION_SCHEMAS[type].settings.shape,
            ).sort();
            const settingKeys = SECTION_FIELDS[type].settings
                .map((setting) => setting.key as string)
                .sort();

            expect(settingKeys, type).toEqual(schemaKeys);
        }
    });
});
