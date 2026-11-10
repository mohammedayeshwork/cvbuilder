import type { PagePlan } from '@/renderer/pagination/paginate';
import type { Column, ResumeContent, Section } from '@/schema';

/** board[page][column] = ids of the sections that start there. */
export type Board = Record<Column, string[]>[];

const emptyPage = (): Record<Column, string[]> => ({ main: [], side: [] });

/**
 * Where each section starts, from the current page plan. One empty page is
 * added at the end so a section can be pushed onto a new page.
 */
export function boardFromPlan(
    content: ResumeContent,
    plan: PagePlan,
    twoColumn: boolean,
): Board {
    const board: Board = plan.map(() => emptyPage());
    const placed = new Set<string>();

    plan.forEach((page, index) => {
        for (const [column, units] of Object.entries(page)) {
            for (const unit of units) {
                const [id, part] = unit.split('|');
                if (part === 'keep' && !placed.has(id)) {
                    board[index][column as Column].push(id);
                    placed.add(id);
                }
            }
        }
    });

    if (board.length === 0) {
        board.push(emptyPage());
    }

    // Sections the plan does not show (yet) stay at the end of their column.
    for (const section of content.sections) {
        if (section.type !== 'header' && !placed.has(section.id)) {
            board[board.length - 1][twoColumn ? section.column : 'main'].push(
                section.id,
            );
        }
    }

    board.push(emptyPage());

    return board;
}

export interface Move {
    id: string;
    page: number;
    index: number;
}

/**
 * Write a rearranged board back into the content: section order (page by
 * page, column by column), each section's column, and for the section that
 * was dropped, a page break when it lands at the top of a later page.
 */
export function applyBoard(
    content: ResumeContent,
    board: Board,
    twoColumn: boolean,
    moved: Move | null,
): ResumeContent {
    const byId = new Map(
        content.sections.map((section) => [section.id, section]),
    );
    const header = content.sections.filter(
        (section) => section.type === 'header',
    );
    const ordered: Section[] = [];

    for (const page of board) {
        for (const column of ['main', 'side'] as const) {
            for (const id of page[column]) {
                const section = byId.get(id);
                if (!section) {
                    continue;
                }

                let next: Section =
                    twoColumn && section.column !== column
                        ? { ...section, column }
                        : section;

                if (moved?.id === id) {
                    const pageBreakBefore = moved.page > 0 && moved.index === 0;
                    if (next.pageBreakBefore !== pageBreakBefore) {
                        next = { ...next, pageBreakBefore };
                    }
                }

                ordered.push(next);
                byId.delete(id);
            }
        }
    }

    // Anything the board did not list keeps its place at the end.
    const rest = content.sections.filter(
        (section) => section.type !== 'header' && byId.has(section.id),
    );

    return { ...content, sections: [...header, ...ordered, ...rest] };
}

/** Find which page and column a section is on in a board. */
export function findInBoard(
    board: Board,
    id: string,
): { page: number; column: Column; index: number } | null {
    for (const [page, columns] of board.entries()) {
        for (const column of ['main', 'side'] as const) {
            const index = columns[column].indexOf(id);
            if (index !== -1) {
                return { page, column, index };
            }
        }
    }

    return null;
}
