import type { PaletteKey } from '@/schema';

export interface Palette {
    key: PaletteKey;
    name: string;
    /** Headings, rules and highlights. AA (4.5:1) against white. */
    accent: string;
    /** Body text. */
    ink: string;
}

const INK = '#1f2328';

export const PALETTES: Record<PaletteKey, Palette> = {
    slate: { key: 'slate', name: 'Slate', accent: '#334155', ink: '#1e293b' },
    navy: { key: 'navy', name: 'Navy', accent: '#1e3a8a', ink: INK },
    ocean: { key: 'ocean', name: 'Ocean', accent: '#075985', ink: INK },
    teal: { key: 'teal', name: 'Teal', accent: '#0f766e', ink: INK },
    forest: { key: 'forest', name: 'Forest', accent: '#166534', ink: INK },
    olive: { key: 'olive', name: 'Olive', accent: '#4d5b16', ink: INK },
    ochre: { key: 'ochre', name: 'Ochre', accent: '#92400e', ink: INK },
    rust: { key: 'rust', name: 'Rust', accent: '#9a3412', ink: INK },
    burgundy: {
        key: 'burgundy',
        name: 'Burgundy',
        accent: '#881337',
        ink: INK,
    },
    rose: { key: 'rose', name: 'Rose', accent: '#be123c', ink: INK },
    plum: { key: 'plum', name: 'Plum', accent: '#6b21a8', ink: INK },
    graphite: {
        key: 'graphite',
        name: 'Graphite',
        accent: '#262626',
        ink: '#171717',
    },
};

/** WCAG relative luminance of a #rrggbb color. */
export function luminance(hex: string): number {
    const channels = [1, 3, 5].map(
        (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
    );
    const [r, g, b] = channels.map((c) =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colors. */
export function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

    return (hi + 0.05) / (lo + 0.05);
}
