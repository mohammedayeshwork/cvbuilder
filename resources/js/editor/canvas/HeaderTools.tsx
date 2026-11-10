import { ImagePlus, Link2, Plus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { newId } from '@/schema';
import type { HeaderItem, Section } from '@/schema';
import { useApply } from '../actions';
import { setItemField } from '../operations';
import { PhotoCropDialog } from '../photo/PhotoCropDialog';
import { ToolbarButton } from '../fields/RichEditable';

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

/** Photo and link controls in the header's toolbar. */
export function HeaderTools({ section }: { section: Section }) {
    const item = section.items[0] as HeaderItem;
    const apply = useApply();
    const input = useRef<HTMLInputElement>(null);
    const [source, setSource] = useState<string | null>(null);
    const set = (key: keyof HeaderItem, value: unknown, group?: string) =>
        apply((c) => setItemField(c, section.id, item.id, key, value), group);

    const pick = (file: File | undefined) => {
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image/') || file.size > MAX_SOURCE_BYTES) {
            toast.error('Choose a JPEG, PNG or WebP image under 15 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            typeof reader.result === 'string' && setSource(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <>
            <ToolbarButton
                label={item.photo ? 'Change photo' : 'Add photo'}
                onClick={() => input.current?.click()}
            >
                <ImagePlus />
            </ToolbarButton>
            {item.photo && (
                <ToolbarButton
                    label="Remove photo"
                    onClick={() => set('photo', null)}
                >
                    <X />
                </ToolbarButton>
            )}
            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    pick(event.target.files?.[0]);
                    event.target.value = '';
                }}
            />
            <PhotoCropDialog
                source={source}
                initialShape={item.photo?.shape ?? 'round'}
                onClose={() => setSource(null)}
                onSave={(photo) => set('photo', photo)}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        aria-label="Edit links"
                        title="Edit links"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <Link2 />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-96 space-y-3" align="end">
                    <p className="text-sm font-medium">Links</p>
                    {item.links.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Add your website, portfolio or profiles.
                        </p>
                    )}
                    {item.links.map((link, index) => {
                        const update = (patch: Partial<typeof link>) =>
                            set(
                                'links',
                                item.links.map((l, i) =>
                                    i === index ? { ...l, ...patch } : l,
                                ),
                                `${link.id}:link`,
                            );

                        return (
                            <div
                                key={link.id}
                                className="grid grid-cols-[1fr_1.4fr_auto] gap-2"
                            >
                                <Input
                                    aria-label="Link label"
                                    placeholder="Label"
                                    maxLength={60}
                                    value={link.label}
                                    onChange={(e) =>
                                        update({ label: e.target.value })
                                    }
                                />
                                <Input
                                    aria-label="Link address"
                                    placeholder="yourwebsite.com"
                                    maxLength={500}
                                    value={link.url}
                                    onChange={(e) =>
                                        update({ url: e.target.value.trim() })
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Remove link"
                                    onClick={() =>
                                        set(
                                            'links',
                                            item.links.filter(
                                                (_, i) => i !== index,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        );
                    })}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={item.links.length >= 10}
                        onClick={() =>
                            set('links', [
                                ...item.links,
                                { id: newId(), label: '', url: '' },
                            ])
                        }
                    >
                        <Plus /> Add link
                    </Button>
                </PopoverContent>
            </Popover>
        </>
    );
}
