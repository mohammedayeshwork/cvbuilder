import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useItem } from '@/renderer/context';
import { addItem, duplicateItem, removeItem } from '../operations';
import { focusItem, useApply } from '../actions';
import { ToolbarButton } from '../fields/RichEditable';
import { SINGLE_ITEM_TYPES } from '@/schema';

/** Hover controls and drag handle around one entry. */
export function ItemFrame({ children }: { children: ReactNode }) {
    const { section } = useItem();

    if (SINGLE_ITEM_TYPES.includes(section.type)) {
        return <>{children}</>;
    }

    return <SortableItem>{children}</SortableItem>;
}

function SortableItem({ children }: { children: ReactNode }) {
    const { section, item } = useItem();
    const apply = useApply();
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
    });

    return (
        <div
            ref={setNodeRef}
            className="cv-item"
            data-item-id={item.id}
            data-dragging={isDragging || undefined}
            style={{ transform: CSS.Translate.toString(transform), transition }}
        >
            <div
                className="cv-toolbar cv-item-controls"
                role="toolbar"
                aria-label="Entry actions"
            >
                <button
                    ref={setActivatorNodeRef}
                    type="button"
                    className="cv-drag-handle"
                    aria-label="Drag to reorder. Press space, then arrow keys."
                    title="Drag to reorder"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical />
                </button>
                <ToolbarButton
                    label="Add entry below"
                    onClick={() => {
                        let id = '';
                        apply((content) => {
                            const [next, newId] = addItem(
                                content,
                                section.id,
                                item.id,
                            );
                            id = newId;
                            return next;
                        });
                        focusItem(id);
                    }}
                >
                    <Plus />
                </ToolbarButton>
                <ToolbarButton
                    label="Duplicate entry"
                    onClick={() =>
                        apply((c) => duplicateItem(c, section.id, item.id))
                    }
                >
                    <Copy />
                </ToolbarButton>
                <ToolbarButton
                    label="Remove entry"
                    onClick={() =>
                        apply((c) => removeItem(c, section.id, item.id))
                    }
                >
                    <Trash2 />
                </ToolbarButton>
            </div>
            {children}
        </div>
    );
}
