import { PALETTES } from '@/design/palettes';
import type { Design } from '@/schema';

export default {
    version: 1,
    palette: 'graphite',
    accent: PALETTES.graphite.accent,
    fontPair: 'garamond-work',
    fontSize: 9.5,
    lineHeight: 1.45,
    sectionSpacing: 1.2,
    pageMargin: 20,
    pageSize: 'A4',
    background: 'none',
    dateFormat: 'MMM YYYY',
    sectionTitle: { case: 'smallcaps', underline: false, icons: false },
    direction: 'ltr',
} satisfies Design;
