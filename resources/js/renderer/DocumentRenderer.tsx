import '@/design/fonts.css';
import './base.css';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
    designVariables,
    MM_TO_PX,
    PAGE_SIZES,
    resolveDesign,
} from '@/design/resolve';
import {
    DEFAULT_SETTINGS,
    type CoverLetterContent,
    type DesignOverrides,
    type DocumentType,
    type ResumeContent,
    type Section,
} from '@/schema';
import { sectionBlocks } from '@/sections/registry';
import { getTemplate } from '@/templates/registry';
import type { TemplateDefinition } from '@/templates/types';
import { ItemScope, RenderProvider, useRender } from './context';
import type { RenderMode } from './context';
import { CoverLetterBody } from './CoverLetterBody';
import { useEdit } from './edit';
import { isBlank } from './format';
import { measureFlow } from './pagination/measure';
import type { ColumnKey } from './pagination/measure';
import { locate, paginate, reconcile } from './pagination/paginate';
import type { PagePlan, PageSpace, Unit } from './pagination/paginate';
import { SectionTitle } from './primitives';

export interface RenderableDocument {
    type: DocumentType;
    template_key: string;
    content: ResumeContent | CoverLetterContent;
    design: DesignOverrides;
}

export interface LayoutInfo {
    pages: number;
    /** Unit ids per page and column ("<sectionId>|keep" starts a section). */
    plan: PagePlan;
    /** Units taller than a page (clipped). */
    oversized: string[];
}

declare global {
    interface Window {
        /** Set once fonts are loaded and pages are laid out; the PDF renderer waits for it. */
        __DOC_READY__?: boolean;
    }
}

interface RendererProps {
    document: RenderableDocument;
    mode: RenderMode;
    /** Render only the first N pages (thumbnails). */
    pageLimit?: number;
    onLayout?: (info: LayoutInfo) => void;
}

/**
 * The single render path for documents: editor, thumbnails, template
 * picker, share page and PDF all go through here.
 */
export function DocumentRenderer({
    document,
    mode,
    pageLimit,
    onLayout,
}: RendererProps) {
    const template = getTemplate(document.template_key);
    const design = useMemo(
        () => resolveDesign(template.design, document.design),
        [template, document.design],
    );
    const rootProps = useMemo(
        (): HTMLAttributes<HTMLDivElement> &
            Record<`data-${string}`, string> => ({
            className: 'cv-document',
            'data-template': template.info.key,
            'data-mode': mode,
            'data-title-case': design.sectionTitle.case,
            'data-title-underline': String(design.sectionTitle.underline),
            dir: design.direction,
            lang: design.direction === 'rtl' ? 'ar' : undefined,
            style: designVariables(design) as CSSProperties,
        }),
        [template, mode, design],
    );

    return (
        <RenderProvider value={{ mode, design, template }}>
            <div {...rootProps}>
                {document.type === 'resume' ? (
                    <ResumePages
                        content={document.content as ResumeContent}
                        rootProps={rootProps}
                        pageLimit={pageLimit}
                        onLayout={onLayout}
                    />
                ) : (
                    <CoverLetterPages
                        content={document.content as CoverLetterContent}
                    />
                )}
            </div>
        </RenderProvider>
    );
}

// ------------------------------------------------------------------ resume

interface Columns {
    header: Section | undefined;
    columns: Partial<Record<ColumnKey, Section[]>>;
}

function splitColumns(
    content: ResumeContent,
    template: TemplateDefinition,
): Columns {
    const header = content.sections.find(
        (section) => section.type === 'header',
    );
    const rest = content.sections.filter(
        (section) => section.type !== 'header',
    );

    if (template.info.layout !== 'two-column') {
        return { header, columns: { main: rest } };
    }

    return {
        header,
        columns: {
            main: rest.filter((section) => section.column === 'main'),
            side: rest.filter((section) => section.column === 'side'),
        },
    };
}

const keepId = (section: Section) => `${section.id}|keep`;
const blockId = (section: Section, key: string) => `${section.id}|${key}`;

function useFontsLoaded(): number {
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const fonts = window.document.fonts;

        if (!fonts) {
            return;
        }

        const bump = () => setVersion((v) => v + 1);
        void fonts.ready.then(bump);
        fonts.addEventListener('loadingdone', bump);

        return () => fonts.removeEventListener('loadingdone', bump);
    }, []);

    return version;
}

/**
 * Lays the resume out on fixed-size pages. A hidden copy of the full flow is
 * measured, paginate() splits it, and each page renders only its units, so
 * the PDF and the screen break pages in exactly the same places.
 */
function ResumePages({
    content,
    rootProps,
    pageLimit,
    onLayout,
}: {
    content: ResumeContent;
    rootProps: HTMLAttributes<HTMLDivElement>;
    pageLimit?: number;
    onLayout?: (info: LayoutInfo) => void;
}) {
    const { template, mode, design } = useRender();
    const layout = useMemo(
        () => splitColumns(content, template),
        [content, template],
    );
    const measureRoot = useRef<HTMLDivElement>(null);
    const visibleRoot = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [plan, setPlan] = useState<PagePlan | null>(null);
    const [focusTick, setFocusTick] = useState(0);
    const fonts = useFontsLoaded();
    const pageHeight = PAGE_SIZES[design.pageSize].height * MM_TO_PX;
    const { Page } = template;

    useEffect(() => setMounted(true), []);

    useLayoutEffect(() => {
        if (!mounted || !measureRoot.current) {
            return;
        }

        const measured = measureFlow(measureRoot.current, pageHeight);
        const units = measured.units as Record<string, Unit[]>;
        const result = paginate(
            units,
            measured.space as Record<string, PageSpace>,
        );
        const ids = Object.fromEntries(
            Object.entries(units).map(([column, list]) => [
                column,
                list.map((u) => u.id),
            ]),
        );

        setPlan((previous) => {
            const focused = focusedUnit(visibleRoot.current);
            const moves =
                previous &&
                focused &&
                JSON.stringify(locate(previous, focused)) !==
                    JSON.stringify(locate(result.pages, focused));

            // Hold the new split back while it would move the field being edited to another page.
            const next = moves ? reconcile(previous, ids) : result.pages;

            return JSON.stringify(next) === JSON.stringify(previous)
                ? previous
                : next;
        });

        onLayout?.({
            pages: result.pages.length,
            plan: result.pages,
            oversized: result.oversized,
        });
        // onLayout is a notification; re-measuring when it changes identity is not needed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, layout, design, mode, fonts, focusTick, pageHeight]);

    useEffect(() => {
        if (mode !== 'print' || !plan) {
            return;
        }

        let cancelled = false;
        void (window.document.fonts?.ready ?? Promise.resolve()).then(() => {
            requestAnimationFrame(() => {
                if (!cancelled) {
                    window.__DOC_READY__ = true;
                }
            });
        });

        return () => {
            cancelled = true;
        };
    }, [mode, plan]);

    const header = layout.header && <HeaderView section={layout.header} />;
    const flow = (column: ColumnKey, include?: Set<string>) =>
        layout.columns[column] ? (
            <SectionList
                sections={layout.columns[column]}
                column={column}
                include={include}
            />
        ) : null;

    const pages: ReactNode[] = (plan ?? [null])
        .slice(0, pageLimit)
        .map((page, index) => {
            const include = (column: ColumnKey) =>
                page ? new Set(page[column] ?? []) : undefined;

            return (
                <Page
                    key={index}
                    index={index}
                    header={index === 0 ? header : null}
                    main={flow('main', include('main'))}
                    side={flow('side', include('side'))}
                />
            );
        });

    return (
        <>
            <div
                ref={visibleRoot}
                className="cv-pages"
                data-paginated={plan ? 'true' : undefined}
                onBlur={() =>
                    requestAnimationFrame(() => setFocusTick((t) => t + 1))
                }
            >
                {pages}
            </div>
            {mounted &&
                createPortal(
                    <div
                        ref={measureRoot}
                        {...rootProps}
                        data-measure=""
                        aria-hidden
                        inert
                    >
                        <Page
                            index={0}
                            header={header}
                            main={flow('main')}
                            side={flow('side')}
                        />
                        <Page
                            index={1}
                            header={null}
                            main={
                                layout.columns.main ? (
                                    <SectionList sections={[]} column="main" />
                                ) : null
                            }
                            side={
                                layout.columns.side ? (
                                    <SectionList sections={[]} column="side" />
                                ) : null
                            }
                        />
                    </div>,
                    window.document.body,
                )}
        </>
    );
}

function focusedUnit(root: HTMLElement | null): string | null {
    const active = window.document.activeElement;

    if (!root || !active || !root.contains(active)) {
        return null;
    }

    return active.closest<HTMLElement>('[data-unit]')?.dataset.unit ?? null;
}

function SectionList({
    sections,
    column,
    include,
}: {
    sections: Section[];
    column: ColumnKey;
    /** Units to render on this page; everything when omitted. */
    include?: Set<string>;
}) {
    return (
        <div className="cv-body-flow" data-column={column}>
            {sections.map((section) => (
                <SectionView
                    key={section.id}
                    section={section}
                    include={include}
                />
            ))}
        </div>
    );
}

/** Outside the editor, entries with nothing filled in are left out. */
function visibleItems(section: Section, mode: RenderMode): Section {
    if (mode === 'edit') {
        return section;
    }

    const items = (section.items as Record<string, unknown>[]).filter((item) =>
        Object.entries(item).some(
            ([key, value]) =>
                !['id', 'level', 'proficiency', 'current'].includes(key) &&
                !isBlank(value),
        ),
    );

    return { ...section, items } as Section;
}

function SectionView({
    section,
    include,
}: {
    section: Section;
    include?: Set<string>;
}) {
    const { mode } = useRender();
    const edit = useEdit();
    const shown = visibleItems(section, mode);
    const onRequest =
        shown.type === 'references' && shown.settings.onRequestOnly;

    if (shown.items.length === 0 && mode !== 'edit' && !onRequest) {
        return null;
    }

    const [first, ...rest] = sectionBlocks(shown);
    const showKeep = !include || include.has(keepId(section));
    const blocks = rest.filter(
        (block) => !include || include.has(blockId(section, block.key)),
    );

    if (!showKeep && blocks.length === 0) {
        return null;
    }

    const body = (
        <section
            className="cv-section"
            data-section={section.type}
            data-section-id={section.id}
            data-continued={showKeep ? undefined : 'true'}
        >
            {showKeep && (
                <div
                    className="cv-keep"
                    data-unit={keepId(section)}
                    data-break-before={
                        section.pageBreakBefore ? 'true' : undefined
                    }
                >
                    <SectionTitle section={section} />
                    {first && <div className="cv-block">{first.node}</div>}
                </div>
            )}
            {blocks.map((block) => (
                <div
                    key={block.key}
                    className="cv-block"
                    data-unit={blockId(section, block.key)}
                >
                    {block.node}
                </div>
            ))}
        </section>
    );

    return mode === 'edit' && edit ? (
        <edit.SectionFrame section={section}>{body}</edit.SectionFrame>
    ) : (
        body
    );
}

function HeaderView({ section }: { section: Section }) {
    const { template, mode } = useRender();
    const edit = useEdit();
    const { Header } = template;
    const header = (
        <ItemScope section={section} item={section.items[0]}>
            <header className="cv-header">
                <Header />
            </header>
        </ItemScope>
    );

    return mode === 'edit' && edit ? (
        <edit.SectionFrame section={section}>{header}</edit.SectionFrame>
    ) : (
        header
    );
}

// ------------------------------------------------------------ cover letter

function CoverLetterPages({ content }: { content: CoverLetterContent }) {
    const { template, mode } = useRender();
    const { Page } = template;
    const sender: Section = {
        id: 'sender-section',
        type: 'header',
        title: '',
        column: 'main',
        pageBreakBefore: false,
        settings: { ...DEFAULT_SETTINGS.header },
        items: [{ id: 'sender', ...content.sender }],
    };

    useEffect(() => {
        if (mode !== 'print') {
            return;
        }
        void (window.document.fonts?.ready ?? Promise.resolve()).then(() => {
            window.__DOC_READY__ = true;
        });
    }, [mode]);

    return (
        <div className="cv-pages">
            <Page
                index={0}
                header={<HeaderView section={sender} />}
                main={<CoverLetterBody content={content} />}
                side={null}
            />
        </div>
    );
}
