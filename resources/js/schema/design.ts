import { z } from 'zod';

export const DESIGN_VERSION = 1;

export const PALETTE_KEYS = [
    'slate',
    'navy',
    'ocean',
    'teal',
    'forest',
    'olive',
    'ochre',
    'rust',
    'burgundy',
    'rose',
    'plum',
    'graphite',
] as const;

export const FONT_PAIR_KEYS = [
    'source',
    'plex',
    'fraunces-inter',
    'garamond-work',
    'dm',
    'lora-karla',
    'grotesk-inter',
    'noto-arabic',
] as const;

export const BACKGROUNDS = ['none', 'dots', 'grid', 'lines', 'corner'] as const;

export const DATE_FORMATS = [
    'MMM YYYY',
    'MMMM YYYY',
    'MM/YYYY',
    'YYYY-MM',
    'YYYY',
] as const;

export const DESIGN_LIMITS = {
    fontSize: { min: 8.5, max: 12 },
    lineHeight: { min: 1.15, max: 1.7 },
    sectionSpacing: { min: 0.6, max: 1.6 },
    pageMargin: { min: 10, max: 25 },
} as const;

const range = (key: keyof typeof DESIGN_LIMITS) =>
    z.number().min(DESIGN_LIMITS[key].min).max(DESIGN_LIMITS[key].max);

export const PaletteKey = z.enum(PALETTE_KEYS);
export const FontPairKey = z.enum(FONT_PAIR_KEYS);

/**
 * Only the user's explicit choices. The effective design is the template
 * defaults merged with these, so switching templates keeps them and
 * "Reset" means removing them.
 */
export const DesignOverrides = z.strictObject({
    version: z.literal(DESIGN_VERSION),
    accent: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i)
        .optional(),
    palette: z.union([PaletteKey, z.literal('custom')]).optional(),
    fontPair: FontPairKey.optional(),
    fontSize: range('fontSize').optional(),
    lineHeight: range('lineHeight').optional(),
    sectionSpacing: range('sectionSpacing').optional(),
    pageMargin: range('pageMargin').optional(),
    pageSize: z.enum(['A4', 'Letter']).optional(),
    background: z.enum(BACKGROUNDS).optional(),
    dateFormat: z.enum(DATE_FORMATS).optional(),
    sectionTitle: z
        .strictObject({
            case: z.enum(['upper', 'smallcaps', 'title']).optional(),
            underline: z.boolean().optional(),
            icons: z.boolean().optional(),
        })
        .optional(),
    direction: z.enum(['ltr', 'rtl']).optional(),
});

export type PaletteKey = z.infer<typeof PaletteKey>;
export type FontPairKey = z.infer<typeof FontPairKey>;
export type DesignOverrides = z.infer<typeof DesignOverrides>;
/** Template defaults and overrides merged: every field set. */
export type Design = Required<Omit<DesignOverrides, 'sectionTitle'>> & {
    sectionTitle: Required<NonNullable<DesignOverrides['sectionTitle']>>;
};
