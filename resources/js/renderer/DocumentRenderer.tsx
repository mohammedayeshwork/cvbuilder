import '@/design/fonts.css';
import './base.css';
import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { designVariables, resolveDesign } from '@/design/resolve';
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
import { ItemScope, RenderProvider, useRender } from './context';
import type { RenderMode } from './context';
import { CoverLetterBody } from './CoverLetterBody';
import { isBlank } from './format';
import { SectionTitle } from './primitives';

export interface RenderableDocument {
    type: DocumentType;
    template_key: string;
    content: ResumeContent | CoverLetterContent;
    design: DesignOverrides;
}

declare global {
    interface Window {
        /** Set once fonts are loaded and the document is laid out; the PDF renderer waits for it. */
        __DOC_READY__?: boolean;
    }
}

/**
 * The single render path for documents: editor, thumbnails, template
 * picker, share page and PDF all go through here.
 */
export function DocumentRenderer({
    document,
    mode,
}: {
    document: RenderableDocument;
    mode: RenderMode;
}) {
    const template = getTemplate(document.template_key);
    const design = useMemo(
        () => resolveDesign(template.design, document.design),
        [template, document.design],
    );
    const style = useMemo(
        () => designVariables(design) as CSSProperties,
        [design],
    );

    useEffect(() => {
        if (mode !== 'print') {
            return;
        }

        let cancelled = false;
        void (window.document.fonts?.ready ?? Promise.resolve()).then(() => {
            if (!cancelled) {
                window.__DOC_READY__ = true;
            }
        });

        return () => {
            cancelled = true;
        };
    }, [mode]);

    return (
        <RenderProvider value={{ mode, design, template }}>
            <div
                className="cv-document"
                data-template={template.info.key}
                data-mode={mode}
                data-title-case={design.sectionTitle.case}
                data-title-underline={design.sectionTitle.underline}
                dir={design.direction}
                lang={design.direction === 'rtl' ? 'ar' : undefined}
                style={style}
            >
                {document.type === 'resume' ? (
                    <ResumePages content={document.content as ResumeContent} />
                ) : (
                    <CoverLetterPages
                        content={document.content as CoverLetterContent}
                    />
                )}
            </div>
        </RenderProvider>
    );
}

function ResumePages({ content }: { content: ResumeContent }) {
    const { template } = useRender();
    const header = content.sections.find(
        (section) => section.type === 'header',
    );
    const rest = content.sections.filter(
        (section) => section.type !== 'header',
    );
    const twoColumn = template.info.layout === 'two-column';
    const main = twoColumn
        ? rest.filter((section) => section.column === 'main')
        : rest;
    const side = twoColumn
        ? rest.filter((section) => section.column === 'side')
        : [];
    const { Page } = template;

    return (
        <Page
            index={0}
            header={header && <HeaderView section={header} />}
            main={<SectionList sections={main} />}
            side={side.length > 0 ? <SectionList sections={side} /> : null}
        />
    );
}

function CoverLetterPages({ content }: { content: CoverLetterContent }) {
    const { template } = useRender();
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

    return (
        <Page
            index={0}
            header={<HeaderView section={sender} />}
            main={<CoverLetterBody content={content} />}
            side={null}
        />
    );
}

function HeaderView({ section }: { section: Section }) {
    const { template } = useRender();
    const { Header } = template;

    return (
        <ItemScope section={section} item={section.items[0]}>
            <header className="cv-header">
                <Header />
            </header>
        </ItemScope>
    );
}

function SectionList({ sections }: { sections: Section[] }) {
    return (
        <div className="cv-body-flow">
            {sections.map((section) => (
                <SectionView key={section.id} section={section} />
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

function SectionView({ section }: { section: Section }) {
    const { mode } = useRender();
    const shown = visibleItems(section, mode);
    const onRequest =
        shown.type === 'references' && shown.settings.onRequestOnly;

    if (shown.items.length === 0 && mode !== 'edit' && !onRequest) {
        return null;
    }

    const [first, ...rest] = sectionBlocks(shown);

    return (
        <section
            className="cv-section"
            data-section={section.type}
            data-section-id={section.id}
        >
            <div className="cv-keep">
                <SectionTitle section={section} />
                {first && <div className="cv-block">{first.node}</div>}
            </div>
            {rest.map((block) => (
                <div key={block.key} className="cv-block">
                    {block.node}
                </div>
            ))}
        </section>
    );
}
