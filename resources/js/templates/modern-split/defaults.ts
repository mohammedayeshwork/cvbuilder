import { PALETTES } from '@/design/palettes';
import type { Design } from '@/schema';

export default {
    version: 1,
    palette: 'teal',
    accent: PALETTES.teal.accent,
    fontPair: 'dm',
    fontSize: 9.5,
    lineHeight: 1.4,
    sectionSpacing: 1,
    pageMargin: 15,
    pageSize: 'A4',
    background: 'none',
    dateFormat: 'MMM YYYY',
    sectionTitle: { case: 'title', underline: false, icons: false },
    direction: 'ltr',
} satisfies Design;
