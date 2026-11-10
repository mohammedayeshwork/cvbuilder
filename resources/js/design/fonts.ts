import type { FontPairKey } from '@/schema';

export interface FontPair {
    key: FontPairKey;
    name: string;
    heading: string;
    body: string;
    /** Suited to right-to-left scripts. */
    rtl?: boolean;
}

/** Every stack ends with Hebrew and Arabic fallbacks so mixed scripts still render. */
const FALLBACK = "'Noto Sans Hebrew Variable', 'Noto Naskh Arabic Variable'";
const serif = (family: string) => `'${family}', ${FALLBACK}, Georgia, serif`;
const sans = (family: string) =>
    `'${family}', ${FALLBACK}, system-ui, sans-serif`;

export const FONT_PAIRS: Record<FontPairKey, FontPair> = {
    source: {
        key: 'source',
        name: 'Source Serif & Source Sans',
        heading: serif('Source Serif 4 Variable'),
        body: sans('Source Sans 3 Variable'),
    },
    plex: {
        key: 'plex',
        name: 'IBM Plex Serif & Plex Sans',
        heading: serif('IBM Plex Serif'),
        body: sans('IBM Plex Sans Variable'),
    },
    'fraunces-inter': {
        key: 'fraunces-inter',
        name: 'Fraunces & Inter',
        heading: serif('Fraunces Variable'),
        body: sans('Inter Variable'),
    },
    'garamond-work': {
        key: 'garamond-work',
        name: 'EB Garamond & Work Sans',
        heading: serif('EB Garamond Variable'),
        body: sans('Work Sans Variable'),
    },
    dm: {
        key: 'dm',
        name: 'DM Serif Display & DM Sans',
        heading: serif('DM Serif Display'),
        body: sans('DM Sans Variable'),
    },
    'lora-karla': {
        key: 'lora-karla',
        name: 'Lora & Karla',
        heading: serif('Lora Variable'),
        body: sans('Karla Variable'),
    },
    'grotesk-inter': {
        key: 'grotesk-inter',
        name: 'Space Grotesk & Inter',
        heading: sans('Space Grotesk Variable'),
        body: sans('Inter Variable'),
    },
    'noto-arabic': {
        key: 'noto-arabic',
        name: 'Noto Kufi & Noto Naskh (Arabic)',
        heading: `'Noto Kufi Arabic Variable', ${FALLBACK}, system-ui, sans-serif`,
        body: `'Noto Naskh Arabic Variable', 'Noto Sans Hebrew Variable', system-ui, serif`,
        rtl: true,
    },
};
