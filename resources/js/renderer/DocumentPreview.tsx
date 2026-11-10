import { useLayoutEffect, useRef, useState } from 'react';
import { MM_TO_PX, PAGE_SIZES, resolveDesign } from '@/design/resolve';
import { getTemplate } from '@/templates/registry';
import { DocumentRenderer } from './DocumentRenderer';
import type { RenderableDocument } from './DocumentRenderer';

/**
 * The first page of a document, scaled to the width of its container.
 * Used for dashboard thumbnails and the template picker.
 */
export function DocumentPreview({
    document,
}: {
    document: RenderableDocument;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);
    const design = resolveDesign(
        getTemplate(document.template_key).design,
        document.design,
    );
    const page = PAGE_SIZES[design.pageSize];
    const width = page.width * MM_TO_PX;
    const height = page.height * MM_TO_PX;

    useLayoutEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) =>
            setScale(entry.contentRect.width / width),
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, [width]);

    return (
        <div
            ref={ref}
            className="relative w-full overflow-hidden bg-white shadow-sm"
            style={{ aspectRatio: `${page.width} / ${page.height}` }}
            aria-hidden
            inert
        >
            {scale > 0 && (
                <div
                    className="pointer-events-none absolute start-0 top-0 origin-top-left"
                    style={{ width, height, transform: `scale(${scale})` }}
                >
                    <DocumentRenderer
                        document={document}
                        mode="view"
                        pageLimit={1}
                    />
                </div>
            )}
        </div>
    );
}
