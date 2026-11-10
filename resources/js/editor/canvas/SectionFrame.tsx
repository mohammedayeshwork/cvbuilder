import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { ArrowDown, ArrowUp, Plus, Settings2, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useRender } from '@/renderer/context';
import { SINGLE_ITEM_TYPES } from '@/schema';
import type { Section } from '@/schema';
import { SECTION_FIELDS } from '@/sections/fields';
import { focusItem, useApply } from '../actions';
import { useEditorStore } from '../context';
import { ToolbarButton } from '../fields/RichEditable';
import {
    addItem,
    moveItem,
    removeSection,
    shiftSection,
    updateSection,
} from '../operations';
import { HeaderTools } from './HeaderTools';

/** Toolbar, settings and "add entry" around one section; sorts its entries. */
export function SectionFrame({
    section,
    children,
}: {
    section: Section;
    children: ReactNode;
}) {
    const { template } = useRender();
    const apply = useApply();
    const store = useEditorStore();
    const fields = SECTION_FIELDS[section.type];
    const single = SINGLE_ITEM_TYPES.includes(section.type);
    const columnAware = template.info.layout === 'two-column';
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }
        const ids = section.items.map((item) => item.id);
        apply((c) =>
            moveItem(
                c,
                section.id,
                ids.indexOf(String(active.id)),
                ids.indexOf(String(over.id)),
            ),
        );
    };

    const remove = () => {
        apply((c) => removeSection(c, section.id));
        toast(`“${section.title}” removed`, {
            action: {
                label: 'Undo',
                onClick: () => store.temporal.getState().undo(),
            },
        });
    };

    const add = () => {
        let id = '';
        apply((content) => {
            const [next, newId] = addItem(content, section.id);
            id = newId;
            return next;
        });
        focusItem(id);
    };

    return (
        <div className="cv-section-frame" data-section-type={section.type}>
            <div
                className="cv-toolbar cv-section-toolbar"
                role="toolbar"
                aria-label={`${fields.label} section`}
            >
                <span className="cv-toolbar-label">{fields.label}</span>
                {section.type === 'header' && <HeaderTools section={section} />}
                {fields.settings.length > 0 && (
                    <SettingsPopover section={section} />
                )}
                {section.type !== 'header' && (
                    <>
                        <ToolbarButton
                            label="Move section up"
                            onClick={() =>
                                apply((c) =>
                                    shiftSection(
                                        c,
                                        section.id,
                                        -1,
                                        columnAware,
                                    ),
                                )
                            }
                        >
                            <ArrowUp />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Move section down"
                            onClick={() =>
                                apply((c) =>
                                    shiftSection(c, section.id, 1, columnAware),
                                )
                            }
                        >
                            <ArrowDown />
                        </ToolbarButton>
                        <ToolbarButton label="Remove section" onClick={remove}>
                            <Trash2 />
                        </ToolbarButton>
                    </>
                )}
            </div>
            <DndContext
                id={`dnd-${section.id}`}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={section.items.map((item) => item.id)}
                    strategy={rectSortingStrategy}
                >
                    {children}
                </SortableContext>
            </DndContext>
            {!single &&
                !(
                    section.type === 'references' &&
                    section.settings.onRequestOnly
                ) && (
                    <button
                        type="button"
                        className="cv-add-entry"
                        onClick={add}
                    >
                        <Plus /> Add to {section.title || fields.label}
                    </button>
                )}
        </div>
    );
}

type AnySetting =
    | { key: string; label: string; kind: 'toggle' }
    | {
          key: string;
          label: string;
          kind: 'select';
          options: { value: string; label: string }[];
      };

function SettingsPopover({ section }: { section: Section }) {
    const apply = useApply();
    const settings = section.settings as Record<string, unknown>;
    const defs = SECTION_FIELDS[section.type]
        .settings as unknown as AnySetting[];
    const set = (key: string, value: unknown) =>
        apply((c) =>
            updateSection(c, section.id, { settings: { [key]: value } }),
        );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Section settings"
                    title="Section settings"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Settings2 />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3" align="end">
                <p className="text-sm font-medium">Show</p>
                {defs.map((def) =>
                    def.kind === 'toggle' ? (
                        <div key={def.key} className="flex items-center gap-2">
                            <Checkbox
                                id={`${section.id}-${def.key}`}
                                checked={settings[def.key] === true}
                                onCheckedChange={(checked) =>
                                    set(def.key, checked === true)
                                }
                            />
                            <Label htmlFor={`${section.id}-${def.key}`}>
                                {def.label}
                            </Label>
                        </div>
                    ) : (
                        <div key={def.key} className="grid gap-1.5">
                            <Label htmlFor={`${section.id}-${def.key}`}>
                                {def.label}
                            </Label>
                            <select
                                id={`${section.id}-${def.key}`}
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                                value={String(settings[def.key])}
                                onChange={(event) =>
                                    set(def.key, event.target.value)
                                }
                            >
                                {def.options.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ),
                )}
            </PopoverContent>
        </Popover>
    );
}

export function AddEntryIcon() {
    return <Plus />;
}
