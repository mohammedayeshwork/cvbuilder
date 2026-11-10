import { Head } from '@inertiajs/react';
import { PAGE_SIZES, resolveDesign } from '@/design/resolve';
import { DocumentRenderer } from '@/renderer/DocumentRenderer';
import { getTemplate } from '@/templates/registry';
import type { CvDocument } from '@/types';

/** What the headless browser prints: pages only, at exact paper size. */
export default function Print({ document }: { document: CvDocument }) {
    const design = resolveDesign(
        getTemplate(document.template_key).design,
        document.design,
    );
    const page = PAGE_SIZES[design.pageSize];

    return (
        <>
            <Head title={document.title} />
            <style>{`
                @page { size: ${page.width}mm ${page.height}mm; margin: 0; }
                html, body { margin: 0; padding: 0; background: #ffffff; }
            `}</style>
            <DocumentRenderer document={document} mode="print" />
        </>
    );
}
