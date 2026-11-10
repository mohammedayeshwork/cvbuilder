import { PALETTES } from '@/design/palettes';
import type { Design } from '@/schema';

export default {
    version: 1,
    palette: 'ocean',
    accent: PALETTES.ocean.accent,
    fontPair: 'grotesk-inter',
    fontSize: 9.5,
    lineHeight: 1.4,
    sectionSpacing: 1,
    pageMargin: 16,
    pageSize: 'A4',
    background: 'none',
    dateFormat: 'MMM YYYY',
    sectionTitle: { case: 'upper', underline: false, icons: false },
    direction: 'ltr',
} satisfies Design;
