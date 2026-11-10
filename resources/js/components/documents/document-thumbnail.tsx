import { DocumentPreview } from '@/renderer/DocumentPreview';
import type { CvDocument } from '@/types';

/** The document's first page, rendered live at thumbnail size. */
export function DocumentThumbnail({ document }: { document: CvDocument }) {
    return <DocumentPreview document={document} />;
}
