import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import documents from '@/routes/documents';
import { emptyCoverLetter, emptyDesign, emptyResume } from '@/schema';
import type { DocumentType, TemplateKey } from '@/schema';
import { TEMPLATE_CATALOG } from '@/templates/catalog';

export function TemplatePicker({
    type,
    onOpenChange,
}: {
    type: DocumentType | null;
    onOpenChange: (open: boolean) => void;
}) {
    const [creating, setCreating] = useState<TemplateKey | null>(null);

    const create = (key: TemplateKey) => {
        if (!type) {
            return;
        }

        const template = TEMPLATE_CATALOG.find((t) => t.key === key)!;

        router.post(
            documents.store.url(),
            {
                type,
                template_key: key,
                content:
                    type === 'resume'
                        ? emptyResume(template.columns)
                        : emptyCoverLetter(),
                design: emptyDesign(),
            } as never,
            {
                onStart: () => setCreating(key),
                onFinish: () => setCreating(null),
            },
        );
    };

    return (
        <Dialog open={type !== null} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        Choose a template for your{' '}
                        {type === 'cover_letter' ? 'cover letter' : 'resume'}
                    </DialogTitle>
                    <DialogDescription>
                        You can switch templates at any time. Your content stays
                        the same.
                    </DialogDescription>
                </DialogHeader>
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {TEMPLATE_CATALOG.map((template) => (
                        <li key={template.key}>
                            <button
                                type="button"
                                disabled={creating !== null}
                                onClick={() => create(template.key)}
                                className={cn(
                                    'group flex w-full flex-col gap-2 rounded-lg border p-3 text-start transition-colors',
                                    'hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                    'disabled:cursor-wait disabled:opacity-60',
                                    creating === template.key &&
                                        'border-primary',
                                )}
                            >
                                <div
                                    aria-hidden
                                    className="flex aspect-[210/297] w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground"
                                >
                                    {template.layout === 'two-column'
                                        ? 'Two columns'
                                        : 'One column'}
                                </div>
                                <span className="font-medium">
                                    {template.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {template.description}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
