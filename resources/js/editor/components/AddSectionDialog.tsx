import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { SECTION_TYPES } from '@/schema';
import type { ResumeContent, SectionType } from '@/schema';
import { SECTION_FIELDS } from '@/sections/fields';
import { SECTION_ICONS } from '@/sections/icons';
import { templateInfo } from '@/templates/catalog';
import { useApply } from '../actions';
import { useEditor } from '../context';
import { addSection } from '../operations';

/** Pick a section type to add at the end of its column. */
export function AddSectionDialog() {
    const [open, setOpen] = useState(false);
    const apply = useApply();
    const content = useEditor((state) => state.content as ResumeContent);
    const templateKey = useEditor((state) => state.template_key);
    const hasSummary = content.sections.some(
        (section) => section.type === 'summary',
    );
    const types = SECTION_TYPES.filter(
        (type) => type !== 'header' && !(type === 'summary' && hasSummary),
    );

    const add = (type: SectionType) => {
        const template = templateInfo(templateKey);
        const column =
            template.layout === 'two-column'
                ? (template.columns[type] ?? 'main')
                : 'main';
        let id = '';
        apply((c) => {
            const [next, newId] = addSection(c, type, column);
            id = newId;
            return next;
        });
        setOpen(false);
        requestAnimationFrame(() => {
            const section = document.querySelector<HTMLElement>(
                `[data-section-id="${id}"]`,
            );
            section?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            section
                ?.querySelector<HTMLElement>(
                    '.cv-entry [contenteditable], [contenteditable]:not(h2 *), .cv-rich-editable',
                )
                ?.focus();
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus /> <span className="max-sm:sr-only">Add section</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add a section</DialogTitle>
                    <DialogDescription>
                        You can rename, move or remove it later.
                    </DialogDescription>
                </DialogHeader>
                <ul className="grid gap-2 sm:grid-cols-2">
                    {types.map((type) => {
                        const Icon = SECTION_ICONS[type];
                        const fields = SECTION_FIELDS[type];

                        return (
                            <li key={type}>
                                <button
                                    type="button"
                                    onClick={() => add(type)}
                                    className="flex w-full items-start gap-3 rounded-lg border p-3 text-start hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                >
                                    <Icon
                                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                        aria-hidden
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            {fields.label}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {fields.description}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
