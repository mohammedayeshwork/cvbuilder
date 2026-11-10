import { FileText } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LayoutInfo } from '@/renderer/DocumentRenderer';

/** "2 pages", with a gentle nudge past two and a warning for clipped content. */
export function PageCount({ layout }: { layout: LayoutInfo }) {
    const long = layout.pages > 2;
    const clipped = layout.oversized.length > 0;
    const label = `${layout.pages} ${layout.pages === 1 ? 'page' : 'pages'}`;
    const hint = clipped
        ? 'An entry is taller than a page and is cut off. Shorten it or split it into two entries.'
        : long
          ? 'Most resumes work best on one or two pages. Consider trimming older or less relevant entries.'
          : null;

    const badge = (
        <span
            data-warn={hint ? 'true' : undefined}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground data-[warn]:bg-amber-100 data-[warn]:text-amber-900 dark:data-[warn]:bg-amber-950 dark:data-[warn]:text-amber-200"
        >
            <FileText className="size-3.5" aria-hidden />
            {label}
        </span>
    );

    if (!hint) {
        return badge;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button type="button" aria-label={`${label}. ${hint}`}>
                    {badge}
                </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{hint}</TooltipContent>
        </Tooltip>
    );
}
