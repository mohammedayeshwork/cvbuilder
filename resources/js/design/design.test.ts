import { describe, expect, it } from 'vite-plus/test';
import type { Design } from '@/schema';
import { contrast, PALETTES } from './palettes';
import { resolveDesign } from './resolve';

const defaults: Design = {
    version: 1,
    accent: '#000000',
    palette: 'navy',
    fontPair: 'source',
    fontSize: 10,
    lineHeight: 1.35,
    sectionSpacing: 1,
    pageMargin: 16,
    pageSize: 'A4',
    background: 'none',
    dateFormat: 'MMM YYYY',
    sectionTitle: { case: 'upper', underline: true, icons: false },
    direction: 'ltr',
};

describe('palettes', () => {
    it.each(Object.values(PALETTES))(
        '$name accent and ink reach AA on white',
        (palette) => {
            expect(contrast(palette.accent, '#ffffff')).toBeGreaterThanOrEqual(
                4.5,
            );
            expect(contrast(palette.ink, '#ffffff')).toBeGreaterThanOrEqual(7);
        },
    );
});

describe('resolveDesign', () => {
    it('uses the template defaults when nothing is overridden', () => {
        expect(resolveDesign(defaults, { version: 1 })).toEqual({
            ...defaults,
            accent: PALETTES.navy.accent,
        });
    });

    it('applies overrides and merges section title options', () => {
        const design = resolveDesign(defaults, {
            version: 1,
            palette: 'teal',
            fontSize: 11,
            sectionTitle: { icons: true },
        });

        expect(design.accent).toBe(PALETTES.teal.accent);
        expect(design.fontSize).toBe(11);
        expect(design.sectionTitle).toEqual({
            case: 'upper',
            underline: true,
            icons: true,
        });
    });

    it('keeps a custom accent only with the custom palette', () => {
        expect(
            resolveDesign(defaults, {
                version: 1,
                palette: 'custom',
                accent: '#123456',
            }).accent,
        ).toBe('#123456');
        expect(
            resolveDesign(defaults, { version: 1, accent: '#123456' }).accent,
        ).toBe(PALETTES.navy.accent);
    });
});
