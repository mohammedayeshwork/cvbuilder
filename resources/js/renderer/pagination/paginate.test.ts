import { describe, expect, it } from 'vite-plus/test';
import { locate, paginate, reconcile } from './paginate';
import type { Unit } from './paginate';

const unit = (
    id: string,
    height: number,
    gapBefore = 10,
    breakBefore = false,
): Unit => ({
    id,
    height,
    gapBefore,
    breakBefore,
});

const space = { first: 500, rest: 600 };

describe('paginate', () => {
    it('keeps everything on one page when it fits', () => {
        const { pages } = paginate(
            { main: [unit('a', 200), unit('b', 200), unit('c', 70)] },
            { main: space },
        );

        expect(pages).toEqual([{ main: ['a', 'b', 'c'] }]);
    });

    it('never splits a unit: the one that does not fit moves to the next page', () => {
        const { pages } = paginate(
            { main: [unit('a', 300), unit('b', 250)] },
            { main: space },
        );

        expect(pages).toEqual([{ main: ['a'] }, { main: ['b'] }]);
    });

    it('counts the gap before a unit, except at the top of a page', () => {
        // 300 + 10 + 190 = 500 fits exactly; the next unit starts page 2 without its gap.
        const { pages } = paginate(
            { main: [unit('a', 300, 99), unit('b', 190), unit('c', 600, 40)] },
            { main: space },
        );

        expect(pages).toEqual([{ main: ['a', 'b'] }, { main: ['c'] }]);
    });

    it('uses the smaller first page and the larger later pages', () => {
        const units = [unit('a', 450), unit('b', 280), unit('c', 280)];
        const { pages } = paginate({ main: units }, { main: space });

        expect(pages.map((p) => p.main)).toEqual([['a'], ['b', 'c']]);
    });

    it('keeps a title with its first entry because they are one unit', () => {
        const { pages } = paginate(
            {
                main: [
                    unit('intro', 420),
                    unit('experience|keep', 120),
                    unit('experience|2', 60),
                ],
            },
            { main: space },
        );

        expect(pages.map((p) => p.main)).toEqual([
            ['intro'],
            ['experience|keep', 'experience|2'],
        ]);
    });

    it('flows two columns independently', () => {
        const { pages } = paginate(
            {
                main: [unit('m1', 400), unit('m2', 400), unit('m3', 400)],
                side: [unit('s1', 100), unit('s2', 100)],
            },
            { main: space, side: space },
        );

        expect(pages).toEqual([
            { main: ['m1'], side: ['s1', 's2'] },
            { main: ['m2'], side: [] },
            { main: ['m3'], side: [] },
        ]);
    });

    it('starts a new page for a page break, but not at the top of the first page', () => {
        const { pages } = paginate(
            {
                main: [
                    unit('a', 50, 0, true),
                    unit('b', 50),
                    unit('c', 50, 10, true),
                ],
            },
            { main: space },
        );

        expect(pages.map((p) => p.main)).toEqual([['a', 'b'], ['c']]);
    });

    it('places an oversized unit alone and reports it', () => {
        const { pages, oversized } = paginate(
            { main: [unit('a', 100), unit('huge', 900), unit('b', 100)] },
            { main: space },
        );

        expect(pages.map((p) => p.main)).toEqual([['a'], ['huge'], ['b']]);
        expect(oversized).toEqual(['huge']);
    });

    it('returns one empty page for an empty document', () => {
        expect(paginate({ main: [] }, { main: space }).pages).toEqual([
            { main: [] },
        ]);
    });
});

describe('reconcile', () => {
    const plan = [{ main: ['a', 'b'] }, { main: ['c', 'd'] }];

    it('drops removed units and keeps the rest in place', () => {
        expect(reconcile(plan, { main: ['a', 'c', 'd'] })).toEqual([
            { main: ['a'] },
            { main: ['c', 'd'] },
        ]);
    });

    it('puts new units right after their predecessor', () => {
        expect(reconcile(plan, { main: ['a', 'b', 'c', 'x', 'd'] })).toEqual([
            { main: ['a', 'b'] },
            { main: ['c', 'x', 'd'] },
        ]);
        expect(
            reconcile(plan, { main: ['n', 'a', 'b', 'c', 'd'] })[0].main,
        ).toEqual(['n', 'a', 'b']);
    });

    it('handles units moving to a column the old plan did not have', () => {
        const next = reconcile(plan, { main: ['a', 'c', 'd'], side: ['b'] });

        expect(locate(next, 'b')).toEqual({ page: 0, column: 'side' });
    });
});
