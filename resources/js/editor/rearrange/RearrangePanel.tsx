import {
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { PagePlan } from '@/renderer/pagination/paginate';
import type { Column, ResumeContent, Section } from '@/schema';
import { SECTION_ICONS } from '@/sections/icons';
import { getTemplate } from '@/templates/registry';
import { useEditor, useEditorStore } from '../context';
import { updateSection } from '../operations';
import { applyBoard, boardFromPlan, findInBoard } from './board';
import type { Board } from './board';

const containerId = (page: number, column: Column) => `page-${page}-${column}`;

function parseContainer(id: string): { page: number; column: Column } | null {
    const match = /^page-(\d+)-(main|side)$/.exec(id);

    return match
        ? { page: Number(match[1]), column: match[2] as Column }
        : null;
}

/**
 * Drag sections between columns and pages. Dropping a section at the top of
 * a later page gives it a page break; everything else follows the natural
 * flow, which the canvas next to the panel shows live.
 */
export function RearrangePanel({ plan }: { plan: PagePlan }) {
    const store = useEditorStore();
    const content = useEditor((state) => state.content as ResumeContent);
    const templateKey = useEditor((state) => state.template_key);
    const twoColumn = getTemplate(templateKey).info.layout === 'two-column';
    const columns: Column[] = twoColumn ? ['main', 'side'] : ['main'];
    const sections = useMemo(
        () => new Map(content.sections.map((s) => [s.id, s])),
        [content],
    );
    const [board, setBoard] = useState<Board>(() =>
        boardFromPlan(content, plan, twoColumn),
    );
    const [dragging, setDragging] = useState<string | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        if (dragging === null) {
            setBoard(boardFromPlan(content, plan, twoColumn));
        }
    }, [content, plan, twoColumn, dragging]);

    const containerOf = (id: string): { page: number; column: Column } | null =>
        parseContainer(id) ?? findInBoard(board, id);

    const onDragOver = ({ active, over }: DragOverEvent) => {
        const from = findInBoard(board, String(active.id));
        const to = over ? containerOf(String(over.id)) : null;

        if (
            !from ||
            !to ||
            (from.page === to.page && from.column === to.column)
        ) {
            return;
        }

        setBoard((current) => {
            const next = current.map((page) => ({
                main: [...page.main],
                side: [...page.side],
            }));
            next[from.page][from.column].splice(from.index, 1);
            const target = next[to.page][to.column];
            const overIndex = target.indexOf(String(over!.id));
            target.splice(
                overIndex === -1 ? target.length : overIndex,
                0,
                String(active.id),
            );

            return next;
        });
    };

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        const id = String(active.id);
        let next = board;
        const from = findInBoard(board, id);
        const to = over ? findInBoard(board, String(over.id)) : null;

        if (
            from &&
            to &&
            from.page === to.page &&
            from.column === to.column &&
            from.index !== to.index
        ) {
            next = board.map((page, index) =>
                index === from.page
                    ? {
                          ...page,
                          [from.column]: arrayMove(
                              page[from.column],
                              from.index,
                              to.index,
                          ),
                      }
                    : page,
            );
        }

        const final = findInBoard(next, id);
        setDragging(null);

        if (final) {
            const state = store.getState();
            state.change({
                content: applyBoard(
                    state.content as ResumeContent,
                    next,
                    twoColumn,
                    {
                        id,
                        page: final.page,
                        index: final.index,
                    },
                ),
            });
        }
    };

    const toggleBreak = (section: Section, value: boolean) => {
        const state = store.getState();
        state.change({
            content: updateSection(state.content as ResumeContent, section.id, {
                pageBreakBefore: value,
            }),
        });
    };

    return (
        <aside
            className="flex w-full flex-col gap-4 lg:w-80"
            aria-label="Rearrange sections"
        >
            <div>
                <h2 className="font-medium">Rearrange</h2>
                <p className="text-sm text-muted-foreground">
                    Drag sections between {twoColumn ? 'columns and ' : ''}
                    pages. Drop one at the top of a page to start it there.
                </p>
            </div>
            <DndContext
                id="rearrange"
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={({ active }: DragStartEvent) =>
                    setDragging(String(active.id))
                }
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={() => {
                    setDragging(null);
                    setBoard(boardFromPlan(content, plan, twoColumn));
                }}
            >
                <ol className="flex flex-col gap-3">
                    {board.map((page, index) => (
                        <li
                            key={index}
                            className="rounded-lg border bg-background p-3"
                        >
                            <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                {index === board.length - 1
                                    ? 'New page'
                                    : `Page ${index + 1}`}
                            </h3>
                            {index === 0 && (
                                <div className="mb-2 rounded-md border border-dashed px-2 py-1.5 text-xs text-muted-foreground">
                                    Header
                                </div>
                            )}
                            <div
                                className={cn(
                                    'grid gap-2',
                                    twoColumn && 'grid-cols-[1.6fr_1fr]',
                                )}
                            >
                                {columns.map((column) => (
                                    <Lane
                                        key={column}
                                        id={containerId(index, column)}
                                        label={
                                            twoColumn
                                                ? column === 'main'
                                                    ? 'Main'
                                                    : 'Sidebar'
                                                : undefined
                                        }
                                        ids={page[column]}
                                    >
                                        {page[column].map((id) => {
                                            const section = sections.get(id);
                                            return (
                                                section && (
                                                    <SectionCard
                                                        key={id}
                                                        section={section}
                                                        onBreakChange={(
                                                            value,
                                                        ) =>
                                                            toggleBreak(
                                                                section,
                                                                value,
                                                            )
                                                        }
                                                    />
                                                )
                                            );
                                        })}
                                    </Lane>
                                ))}
                            </div>
                        </li>
                    ))}
                </ol>
                <DragOverlay>
                    {dragging && sections.get(dragging) && (
                        <CardBody section={sections.get(dragging)!} lifted />
                    )}
                </DragOverlay>
            </DndContext>
        </aside>
    );
}

function Lane({
    id,
    label,
    ids,
    children,
}: {
    id: string;
    label?: string;
    ids: string[];
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div>
            {label && (
                <p className="mb-1 text-[11px] text-muted-foreground">
                    {label}
                </p>
            )}
            <SortableContext
                id={id}
                items={ids}
                strategy={verticalListSortingStrategy}
            >
                <ul
                    ref={setNodeRef}
                    className={cn(
                        'flex min-h-10 flex-col gap-1.5 rounded-md p-1 transition-colors',
                        isOver ? 'bg-primary/10' : 'bg-muted/60',
                    )}
                >
                    {children}
                </ul>
            </SortableContext>
        </div>
    );
}

function SectionCard({
    section,
    onBreakChange,
}: {
    section: Section;
    onBreakChange: (value: boolean) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: section.id,
    });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(isDragging && 'opacity-40')}
        >
            <CardBody
                section={section}
                handle={
                    <button
                        ref={setActivatorNodeRef}
                        type="button"
                        className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted"
                        aria-label={`Move ${section.title}. Press space, then arrow keys.`}
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="size-3.5" />
                    </button>
                }
                onBreakChange={onBreakChange}
            />
        </li>
    );
}

function CardBody({
    section,
    handle,
    lifted,
    onBreakChange,
}: {
    section: Section;
    handle?: React.ReactNode;
    lifted?: boolean;
    onBreakChange?: (value: boolean) => void;
}) {
    const Icon = SECTION_ICONS[section.type];
    const checkbox = `break-${section.id}`;

    return (
        <div
            className={cn(
                'rounded-md border bg-background px-2 py-1.5 text-sm',
                lifted && 'shadow-lg',
            )}
        >
            <div className="flex items-center gap-1.5">
                {handle}
                <Icon
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">{section.title}</span>
            </div>
            {onBreakChange && (
                <label
                    htmlFor={checkbox}
                    className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                    <Checkbox
                        id={checkbox}
                        className="size-3.5"
                        checked={section.pageBreakBefore}
                        onCheckedChange={(checked) =>
                            onBreakChange(checked === true)
                        }
                    />
                    Start on a new page
                </label>
            )}
        </div>
    );
}
