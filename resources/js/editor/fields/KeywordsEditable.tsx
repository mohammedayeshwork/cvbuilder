import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { KeywordsControlProps } from '@/renderer/edit';

const parse = (text: string) =>
    text
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean)
        .slice(0, 30)
        .map((keyword) => keyword.slice(0, 60));

/**
 * Keywords typed as "a, b, c". The text is only rewritten when the parsed
 * keywords differ, so a trailing comma survives while typing.
 */
export function KeywordsEditable({
    value,
    onChange,
    placeholder,
    label,
    className,
}: KeywordsControlProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const element = ref.current;

        if (
            element &&
            parse(element.textContent ?? '').join('\u0000') !==
                value.join('\u0000')
        ) {
            element.textContent = value.join(', ');
        }
    }, [value]);

    return (
        <span
            ref={ref}
            role="textbox"
            aria-label={label}
            contentEditable="plaintext-only"
            suppressContentEditableWarning
            data-placeholder={placeholder}
            className={cn('cv-editable', className)}
            onInput={(event) =>
                onChange(parse(event.currentTarget.textContent ?? ''))
            }
            onKeyDown={(event) =>
                event.key === 'Enter' && event.preventDefault()
            }
        />
    );
}
