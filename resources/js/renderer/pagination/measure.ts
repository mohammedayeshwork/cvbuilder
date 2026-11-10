import type { PageSpace, Unit } from './paginate';

export const COLUMNS = ['main', 'side'] as const;
export type ColumnKey = (typeof COLUMNS)[number];

export interface Measurement {
    units: Partial<Record<ColumnKey, Unit[]>>;
    space: Partial<Record<ColumnKey, PageSpace>>;
}

/**
 * Measure the hidden full-length flow. `root` holds two pages: the first
 * with every section, and an empty continuation page (no header) that tells
 * how much room later pages have.
 */
export function measureFlow(
    root: HTMLElement,
    pageHeight: number,
): Measurement {
    const [first, continuation] =
        root.querySelectorAll<HTMLElement>(':scope .cv-page');
    const result: Measurement = { units: {}, space: {} };

    if (!first) {
        return result;
    }

    const bottomOf = (page: HTMLElement) =>
        page.getBoundingClientRect().top +
        pageHeight -
        parseFloat(getComputedStyle(page).paddingBottom || '0');

    for (const column of COLUMNS) {
        const flow = first.querySelector<HTMLElement>(
            `.cv-body-flow[data-column="${column}"]`,
        );

        if (!flow) {
            continue;
        }

        const later = continuation?.querySelector<HTMLElement>(
            `.cv-body-flow[data-column="${column}"]`,
        );
        const firstSpace = bottomOf(first) - flow.getBoundingClientRect().top;

        result.space[column] = {
            first: firstSpace,
            rest:
                later && continuation
                    ? bottomOf(continuation) - later.getBoundingClientRect().top
                    : firstSpace,
        };

        let previous: DOMRect | null = null;
        result.units[column] = [
            ...flow.querySelectorAll<HTMLElement>('[data-unit]'),
        ].map((element) => {
            const rect = element.getBoundingClientRect();
            const unit: Unit = {
                id: element.dataset.unit!,
                height: rect.height,
                gapBefore: previous
                    ? Math.max(0, rect.top - previous.bottom)
                    : 0,
                breakBefore: element.dataset.breakBefore === 'true',
            };
            previous = rect;

            return unit;
        });
    }

    return result;
}
