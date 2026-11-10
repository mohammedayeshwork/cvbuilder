/**
 * Pure page-splitting. Each column is a list of unbreakable units (a section
 * title kept with its first block, then each further block). Units are
 * flowed onto fixed-height pages, each column independently.
 */

export interface Unit {
    id: string;
    /** Height of the unit itself, in px. */
    height: number;
    /** Space between the previous unit and this one; dropped at the top of a page. */
    gapBefore: number;
    /** Start a new page here (a section with "page break before"). */
    breakBefore: boolean;
}

export interface PageSpace {
    /** Usable column height on the first page (below the header). */
    first: number;
    /** Usable column height on every later page. */
    rest: number;
}

/** pages[i][column] = ids of the units on page i in that column. */
export type PagePlan = Record<string, string[]>[];

export interface Pagination {
    pages: PagePlan;
    /** Units taller than a whole page; they are placed alone and get clipped. */
    oversized: string[];
}

/** Rounding slack so sub-pixel measurements never push a unit over. */
const EPSILON = 0.5;

export function paginate(
    columns: Record<string, Unit[]>,
    space: Record<string, PageSpace>,
): Pagination {
    const perColumn: Record<string, string[][]> = {};
    const oversized: string[] = [];

    for (const [column, units] of Object.entries(columns)) {
        const pages: string[][] = [[]];
        let used = 0;

        for (const unit of units) {
            let page = pages[pages.length - 1];
            const capacity = () =>
                pages.length === 1 ? space[column].first : space[column].rest;
            const needed = () =>
                (page.length > 0 ? unit.gapBefore : 0) + unit.height;

            if (
                page.length > 0 &&
                (unit.breakBefore || used + needed() > capacity() + EPSILON)
            ) {
                page = [];
                pages.push(page);
                used = 0;
            }

            used += needed();
            page.push(unit.id);

            if (unit.height > capacity() + EPSILON) {
                oversized.push(unit.id);
            }
        }

        perColumn[column] = pages;
    }

    const count = Math.max(
        1,
        ...Object.values(perColumn).map((pages) => pages.length),
    );
    const pages: PagePlan = Array.from({ length: count }, (_, index) =>
        Object.fromEntries(
            Object.entries(perColumn).map(([column, list]) => [
                column,
                list[index] ?? [],
            ]),
        ),
    );

    return { pages, oversized };
}

/** Page index and column of a unit, if it is in the plan. */
export function locate(
    plan: PagePlan,
    id: string,
): { page: number; column: string } | null {
    for (const [page, columns] of plan.entries()) {
        for (const [column, ids] of Object.entries(columns)) {
            if (ids.includes(id)) {
                return { page, column };
            }
        }
    }

    return null;
}

/**
 * Bring an older plan up to date with the current units without moving any
 * unit that is still there: removed units are dropped and new ones are
 * placed right after their predecessor. Used while re-pagination is held
 * back so the focused field does not jump to another page.
 */
export function reconcile(
    plan: PagePlan,
    columns: Record<string, string[]>,
): PagePlan {
    const next: PagePlan = plan.map((page) =>
        Object.fromEntries(
            Object.keys(columns).map((column) => [
                column,
                (page[column] ?? []).filter((id) =>
                    columns[column].includes(id),
                ),
            ]),
        ),
    );

    if (next.length === 0) {
        next.push(
            Object.fromEntries(
                Object.keys(columns).map((column) => [column, []]),
            ),
        );
    }

    for (const [column, ids] of Object.entries(columns)) {
        ids.forEach((id, index) => {
            if (locate(next, id)) {
                return;
            }

            const previous = ids[index - 1];
            const at = previous ? locate(next, previous) : null;
            const page = next[at?.page ?? 0][column];
            page.splice(previous ? page.indexOf(previous) + 1 : 0, 0, id);
        });
    }

    return next;
}
