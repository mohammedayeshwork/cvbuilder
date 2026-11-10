import type { Design, PartialDate } from '@/schema';

const MONTHS_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
const MONTHS_LONG = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/** "2021-03" → "Mar 2021" (or the chosen format). Year-only dates stay "2021". */
export function formatPartialDate(
    value: PartialDate,
    format: Design['dateFormat'],
): string {
    if (!value) {
        return '';
    }

    const [year, monthText] = value.split('-');

    if (!monthText || format === 'YYYY') {
        return year;
    }

    const month = Number(monthText);

    switch (format) {
        case 'MMM YYYY':
            return `${MONTHS_SHORT[month - 1]} ${year}`;
        case 'MMMM YYYY':
            return `${MONTHS_LONG[month - 1]} ${year}`;
        case 'MM/YYYY':
            return `${monthText}/${year}`;
        case 'YYYY-MM':
            return value;
    }
}

/** "Mar 2021 – Present", "2019 – 2021", "2019". */
export function formatRange(
    start: PartialDate,
    end: PartialDate,
    current: boolean,
    format: Design['dateFormat'],
): string {
    const from = formatPartialDate(start, format);
    const to = current ? 'Present' : formatPartialDate(end, format);

    if (from && to) {
        return from === to ? from : `${from} – ${to}`;
    }

    return from || to;
}

/** Adds https:// to scheme-less links. The schema already rejects other schemes. */
export function normalizeUrl(url: string): string {
    if (url === '') {
        return '';
    }

    return /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
}

/** "https://www.example.com/me/" → "example.com/me". */
export function displayUrl(url: string): string {
    return url
        .replace(/^(https?:\/\/|mailto:)/i, '')
        .replace(/^www\./i, '')
        .replace(/\/$/, '');
}

export function isBlank(value: unknown): boolean {
    if (value === null || value === undefined || value === false) {
        return true;
    }

    if (typeof value === 'string') {
        return value.replace(/<[^>]*>/g, '').trim() === '';
    }

    return Array.isArray(value) && value.length === 0;
}
