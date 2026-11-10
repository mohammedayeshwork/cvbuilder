import { PALETTES } from '@/design/palettes';
import type { Design } from '@/schema';

export default {
    version: 1,
    palette: 'navy',
    accent: PALETTES.navy.accent,
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
} satisfies Design;
