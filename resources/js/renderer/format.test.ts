import { describe, expect, it } from 'vite-plus/test';
import {
    displayUrl,
    formatPartialDate,
    formatRange,
    isBlank,
    normalizeUrl,
} from './format';

describe('date formatting', () => {
    it.each([
        ['MMM YYYY', 'Mar 2021'],
        ['MMMM YYYY', 'March 2021'],
        ['MM/YYYY', '03/2021'],
        ['YYYY-MM', '2021-03'],
        ['YYYY', '2021'],
    ] as const)('%s', (format, expected) => {
        expect(formatPartialDate('2021-03', format)).toBe(expected);
    });

    it('keeps year-only dates as the year', () => {
        expect(formatPartialDate('2019', 'MMMM YYYY')).toBe('2019');
        expect(formatPartialDate(null, 'MMM YYYY')).toBe('');
    });

    it('formats ranges', () => {
        expect(formatRange('2021-03', null, true, 'MMM YYYY')).toBe(
            'Mar 2021 – Present',
        );
        expect(formatRange('2019', '2021', false, 'MMM YYYY')).toBe(
            '2019 – 2021',
        );
        expect(formatRange('2019', '2019', false, 'MMM YYYY')).toBe('2019');
        expect(formatRange(null, '2021-12', false, 'MM/YYYY')).toBe('12/2021');
        expect(formatRange(null, null, false, 'MMM YYYY')).toBe('');
    });
});

describe('links', () => {
    it('adds https to scheme-less links and tidies them for display', () => {
        expect(normalizeUrl('linkedin.com/in/me')).toBe(
            'https://linkedin.com/in/me',
        );
        expect(normalizeUrl('mailto:a@b.co')).toBe('mailto:a@b.co');
        expect(displayUrl('https://www.example.com/me/')).toBe(
            'example.com/me',
        );
    });

    it('treats empty HTML as blank', () => {
        expect(isBlank('<p></p>')).toBe(true);
        expect(isBlank('<p>x</p>')).toBe(false);
        expect(isBlank([])).toBe(true);
    });
});
