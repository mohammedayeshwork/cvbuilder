// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { DocumentRenderer } from '@/renderer/DocumentRenderer';
import { expectedTexts } from '@/renderer/test-utils';
import { DesignOverrides, emptyDesign, TEMPLATE_KEYS } from '@/schema';
import type { ResumeContent } from '@/schema';
import { switchTemplate } from '@/editor/design/operations';
import { TEMPLATE_CATALOG } from './catalog';
import { TEMPLATES } from './registry';

afterEach(cleanup);

const samples = import.meta.glob<{ content: ResumeContent }>(
    '../../samples/*.json',
    { eager: true, import: 'default' },
);

describe('template registry', () => {
    it('has a template, catalog entry and sample for every key', () => {
        for (const key of TEMPLATE_KEYS) {
            expect(TEMPLATES[key].info.key).toBe(key);
            expect(TEMPLATE_CATALOG.some((t) => t.key === key)).toBe(true);
            expect(
                TEMPLATES[key].thumbnail.sample.content.sections.length,
            ).toBeGreaterThan(3);
        }
    });

    it('gives every template a complete, valid default design', () => {
        const keys = Object.keys(TEMPLATES.classic.design).sort();

        for (const template of Object.values(TEMPLATES)) {
            expect(
                Object.keys(template.design).sort(),
                template.info.key,
            ).toEqual(keys);
            expect(
                DesignOverrides.safeParse(template.design).error,
                template.info.key,
            ).toBeUndefined();
        }
    });
});

describe('switching templates', () => {
    it.each(Object.entries(samples))(
        'keeps %s identical and fully visible in every template',
        (_, sample) => {
            let content = sample.content;

            for (const key of TEMPLATE_KEYS) {
                const switched = switchTemplate(content, key);

                // Only columns may change; every field keeps its value.
                expect(
                    switched.sections.map(({ column: _c, ...rest }) => rest),
                ).toEqual(
                    content.sections.map(({ column: _c, ...rest }) => rest),
                );
                content = switched;

                const { container, unmount } = render(
                    <DocumentRenderer
                        document={{
                            type: 'resume',
                            template_key: key,
                            content,
                            design: emptyDesign(),
                        }}
                        mode="view"
                    />,
                );
                const text = container.textContent!.replace(/\s+/g, ' ');

                for (const expected of expectedTexts(
                    content,
                    TEMPLATES[key].design.dateFormat,
                )) {
                    expect(text, `${key}: ${expected}`).toContain(
                        expected.replace(/\s+/g, ' '),
                    );
                }

                expect(
                    container.querySelector(`[data-template="${key}"]`),
                ).not.toBeNull();
                unmount();
            }
        },
    );
});
