import { headerItem } from '@/schema';
import { templateInfo } from '@/templates/catalog';
import type { CvDocument } from '@/types';

/** Stand-in page preview until the live renderer arrives. */
export function DocumentThumbnail({ document }: { document: CvDocument }) {
    const name =
        document.type === 'resume'
            ? headerItem(document.content)?.name
            : document.content.sender.name;
    const template = templateInfo(document.template_key);

    return (
        <div className="flex aspect-[210/297] flex-col gap-2 bg-white p-5 text-neutral-900 shadow-sm">
            <div className="truncate text-sm font-semibold">
                {name || 'Your name'}
            </div>
            <div className="h-px bg-neutral-200" />
            {template.layout === 'two-column' ? (
                <div className="grid flex-1 grid-cols-[2fr_1fr] gap-3">
                    <Lines count={9} />
                    <Lines count={6} />
                </div>
            ) : (
                <Lines count={12} />
            )}
        </div>
    );
}

function Lines({ count }: { count: number }) {
    return (
        <div className="flex flex-col gap-1.5">
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="h-1 rounded-full bg-neutral-200"
                    style={{ width: `${60 + ((i * 37) % 40)}%` }}
                />
            ))}
        </div>
    );
}
