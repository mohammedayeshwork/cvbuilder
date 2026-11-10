import type { Design, DesignOverrides } from '@/schema';
import { FONT_PAIRS } from './fonts';
import { PALETTES } from './palettes';

export const PAGE_SIZES = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
} as const;

export const MM_TO_PX = 96 / 25.4;

/** Template defaults with the user's overrides on top. */
export function resolveDesign(
    defaults: Design,
    overrides: DesignOverrides,
): Design {
    const { sectionTitle, ...rest } = overrides;
    const design = { ...defaults, ...stripUndefined(rest) } as Design;

    design.sectionTitle = {
        ...defaults.sectionTitle,
        ...stripUndefined(sectionTitle ?? {}),
    };

    if (design.palette !== 'custom') {
        design.accent = PALETTES[design.palette].accent;
    }

    return design;
}

/** CSS custom properties consumed by the renderer and template styles. */
export function designVariables(design: Design): Record<string, string> {
    const fonts = FONT_PAIRS[design.fontPair];
    const ink =
        design.palette === 'custom' ? '#1f2328' : PALETTES[design.palette].ink;
    const page = PAGE_SIZES[design.pageSize];

    return {
        '--accent': design.accent,
        '--ink': ink,
        '--font-heading': fonts.heading,
        '--font-body': fonts.body,
        '--fs': `${design.fontSize}pt`,
        '--lh': String(design.lineHeight),
        '--spacing': String(design.sectionSpacing),
        '--margin': `${design.pageMargin}mm`,
        '--page-w': `${page.width}mm`,
        '--page-h': `${page.height}mm`,
    };
}

function stripUndefined<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(value).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
}
