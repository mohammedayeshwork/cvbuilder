import { describe, expect, it } from 'vite-plus/test';
import { emptyResume } from '@/schema';
import {
    resetDesign,
    setDesign,
    SIZE_PRESETS,
    switchTemplate,
} from './operations';

describe('design overrides', () => {
    it('sets, merges and removes overrides', () => {
        let design = setDesign(
            { version: 1 },
            { fontSize: 11, sectionTitle: { icons: true } },
        );
        design = setDesign(design, { sectionTitle: { underline: false } });

        expect(design).toEqual({
            version: 1,
            fontSize: 11,
            sectionTitle: { icons: true, underline: false },
        });
        expect(setDesign(design, SIZE_PRESETS.normal)).toEqual({
            version: 1,
            sectionTitle: design.sectionTitle,
        });
        expect(resetDesign(design)).toEqual({ version: 1 });
    });
});

describe('switchTemplate', () => {
    it('fills a sidebar from the target template when nothing is in one', () => {
        const content = emptyResume();
        const next = switchTemplate(content, 'modern-split');

        expect(next.sections.find((s) => s.type === 'skills')!.column).toBe(
            'side',
        );
        expect(next.sections.find((s) => s.type === 'experience')!.column).toBe(
            'main',
        );
    });

    it('keeps the user’s columns once a sidebar is in use', () => {
        const content = emptyResume();
        content.sections = content.sections.map((s) =>
            s.type === 'education' ? { ...s, column: 'side' } : s,
        );

        expect(switchTemplate(content, 'compact')).toBe(content);
    });

    it('leaves content alone for single-column templates', () => {
        const content = emptyResume();

        expect(switchTemplate(content, 'timeline')).toBe(content);
    });
});
