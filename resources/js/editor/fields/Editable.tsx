import { useLayoutEffect, useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import type { TextControlProps } from '@/renderer/edit';

/**
 * Single-line plain text edited in place. The DOM is the source of truth
 * while typing; it is only rewritten when the value changes from outside
 * (undo, redo), so the caret never jumps.
 */
export function Editable({
    value,
    onChange,
    placeholder,
    label,
    maxLength,
    className,
    field,
    spellCheck = true,
}: TextControlProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const element = ref.current;

        if (element && element.textContent !== value) {
            element.textContent = value;
            if (document.activeElement === element) {
                placeCaretAtEnd(element);
            }
        }
    }, [value]);

    const commit = (element: HTMLElement) => {
        let text = (element.textContent ?? '').replace(/\n/g, ' ');

        if (maxLength !== undefined && text.length > maxLength) {
            text = text.slice(0, maxLength);
            element.textContent = text;
            placeCaretAtEnd(element);
        }

        onChange(text);
    };

    return (
        <span
            ref={ref}
            role="textbox"
            aria-label={label}
            aria-placeholder={placeholder}
            contentEditable="plaintext-only"
            suppressContentEditableWarning
            spellCheck={spellCheck}
            data-placeholder={placeholder}
            data-field={field}
            className={cn('cv-editable', className)}
            onInput={(event) => commit(event.currentTarget)}
            onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    focusNextField(event.currentTarget);
                }
            }}
            onPaste={(event: ClipboardEvent<HTMLSpanElement>) => {
                event.preventDefault();
                const text = event.clipboardData
                    .getData('text/plain')
                    .replace(/\s*\n\s*/g, ' ');
                document.execCommand('insertText', false, text);
            }}
        />
    );
}

export function placeCaretAtEnd(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

/** Enter moves to the next editable field on the page, like Tab. */
function focusNextField(from: HTMLElement): void {
    const fields = [
        ...document.querySelectorAll<HTMLElement>(
            '.cv-document [contenteditable], .cv-document .cv-rich-editable',
        ),
    ];
    const next = fields[fields.indexOf(from) + 1];

    next?.focus();
}
