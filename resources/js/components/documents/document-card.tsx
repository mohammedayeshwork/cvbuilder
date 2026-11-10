import { Link, router } from '@inertiajs/react';
import { Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DocumentThumbnail } from '@/components/documents/document-thumbnail';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/lib/format';
import documents from '@/routes/documents';
import { templateInfo } from '@/templates/catalog';
import type { CvDocument } from '@/types';

export function DocumentCard({
    document,
    onRename,
    onDelete,
}: {
    document: CvDocument;
    onRename: (document: CvDocument) => void;
    onDelete: (document: CvDocument) => void;
}) {
    const href = documents.edit.url(document);

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card">
            <div className="bg-muted p-4">
                <div className="mx-auto max-w-56 transition-transform group-hover:-translate-y-0.5">
                    <DocumentThumbnail document={document} />
                </div>
            </div>
            <div className="flex items-start gap-2 p-3">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">
                        <Link
                            href={href}
                            className="rounded-sm after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                        >
                            {document.title}
                        </Link>
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {templateInfo(document.template_key).name} · Edited{' '}
                        {timeAgo(document.updated_at)}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 size-8 shrink-0"
                            aria-label="Document actions"
                        >
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onRename(document)}>
                            <Pencil /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() =>
                                router.post(
                                    documents.duplicate.url(document),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <Copy /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(document)}
                        >
                            <Trash2 /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </article>
    );
}
