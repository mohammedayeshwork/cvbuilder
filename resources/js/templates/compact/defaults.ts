import { PALETTES } from '@/design/palettes';
import type { Design } from '@/schema';

export default {
    version: 1,
    palette: 'rust',
    accent: PALETTES.rust.accent,
    fontPair: 'plex',
    fontSize: 9,
    lineHeight: 1.3,
    sectionSpacing: 0.8,
    pageMargin: 12,
    pageSize: 'A4',
    background: 'none',
    dateFormat: 'MM/YYYY',
    sectionTitle: { case: 'upper', underline: true, icons: false },
    direction: 'ltr',
} satisfies Design;
