import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { Bold, Italic, Link2, List, Underline } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { RichControlProps } from '@/renderer/edit';
import { isBlank } from '@/renderer/format';

/** Tiptap's empty document is "<p></p>"; store that as "". */
const normalize = (editor: Editor) => (editor.isEmpty ? '' : editor.getHTML());

/**
 * Rich text edited in place. Outside of focus it is plain static HTML in
 * the same markup the renderer uses, so mounting Tiptap on focus does not
 * move anything on the page.
 */
export function RichEditable({
    html,
    onChange,
    placeholder,
    label,
    className,
}: RichControlProps) {
    const [activeAt, setActiveAt] = useState<
        { x: number; y: number } | 'end' | null
    >(null);
    const wrapper = useRef<HTMLDivElement>(null);

    const activate = (
        event: MouseEvent | FocusEvent,
        at: { x: number; y: number } | 'end',
    ) => {
        if (
            activeAt === null &&
            !(event.target as HTMLElement).closest('a[href]')
        ) {
            setActiveAt(at);
        }
    };

    return (
        <div
            ref={wrapper}
            className={cn('cv-rich-field', className)}
            onBlur={(event) => {
                if (
                    !wrapper.current?.contains(
                        event.relatedTarget as Node | null,
                    )
                ) {
                    setActiveAt(null);
                }
            }}
        >
            {activeAt === null ? (
                <div
                    role="textbox"
                    aria-multiline
                    aria-label={label}
                    tabIndex={0}
                    className={cn(
                        'cv-rich cv-rich-editable',
                        isBlank(html) && 'cv-placeholder',
                    )}
                    onMouseDown={(event) =>
                        activate(event, { x: event.clientX, y: event.clientY })
                    }
                    onFocus={(event) => activate(event, 'end')}
                    {...(isBlank(html)
                        ? { children: <p>{placeholder}</p> }
                        : { dangerouslySetInnerHTML: { __html: html } })}
                />
            ) : (
                <ActiveEditor
                    html={html}
                    onChange={onChange}
                    placeholder={placeholder}
                    label={label}
                    focusAt={activeAt}
                />
            )}
        </div>
    );
}

function ActiveEditor({
    html,
    onChange,
    placeholder,
    label,
    focusAt,
}: Omit<RichControlProps, 'className'> & {
    focusAt: { x: number; y: number } | 'end';
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                code: false,
                codeBlock: false,
                heading: false,
                horizontalRule: false,
                orderedList: false,
                strike: false,
                dropcursor: false,
                gapcursor: false,
                trailingNode: false,
                undoRedo: false,
                link: {
                    openOnClick: false,
                    autolink: true,
                    defaultProtocol: 'https',
                    protocols: ['http', 'https', 'mailto'],
                    isAllowedUri: (url) => /^(https?:|mailto:)/i.test(url),
                    HTMLAttributes: {
                        rel: 'noopener noreferrer',
                        target: null,
                    },
                },
            }),
            Placeholder.configure({ placeholder: placeholder ?? '' }),
        ],
        content: html,
        editorProps: {
            attributes: {
                class: 'cv-rich',
                'aria-label': label,
                'aria-multiline': 'true',
                role: 'textbox',
            },
        },
        onUpdate: ({ editor }) => onChange(normalize(editor)),
        onCreate: ({ editor }) => {
            const position =
                focusAt === 'end'
                    ? null
                    : editor.view.posAtCoords({
                          left: focusAt.x,
                          top: focusAt.y,
                      })?.pos;
            editor.commands.focus(position ?? 'end');
        },
    });

    // Undo and redo change the value from outside; follow them.
    useEffect(() => {
        if (editor && !editor.isDestroyed && normalize(editor) !== html) {
            editor.commands.setContent(html, { emitUpdate: false });
        }
    }, [editor, html]);

    return (
        <>
            {editor && <RichToolbar editor={editor} />}
            <EditorContent editor={editor} />
        </>
    );
}

function RichToolbar({ editor }: { editor: Editor }) {
    const [linking, setLinking] = useState(false);
    const [url, setUrl] = useState('');
    const state = useEditorState({
        editor,
        selector: ({ editor }) => ({
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            list: editor.isActive('bulletList'),
            link: editor.isActive('link'),
        }),
    });

    const applyLink = () => {
        const href = url.trim();

        if (href === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            const full = /^(https?:\/\/|mailto:)/i.test(href)
                ? href
                : `https://${href}`;
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: full })
                .run();
        }

        setLinking(false);
    };

    return (
        <div
            className="cv-toolbar cv-rich-toolbar"
            role="toolbar"
            aria-label="Text formatting"
        >
            {linking ? (
                <form
                    className="cv-toolbar-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        applyLink();
                    }}
                >
                    <input
                        autoFocus
                        value={url}
                        placeholder="https://…"
                        aria-label="Link address"
                        onChange={(event) => setUrl(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                setLinking(false);
                                editor.commands.focus();
                            }
                        }}
                    />
                    <button type="submit">Apply</button>
                </form>
            ) : (
                <>
                    <ToolbarButton
                        label="Bold"
                        active={state.bold}
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                    >
                        <Bold />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Italic"
                        active={state.italic}
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                    >
                        <Italic />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Underline"
                        active={state.underline}
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                    >
                        <Underline />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Bullet list"
                        active={state.list}
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                    >
                        <List />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Link"
                        active={state.link}
                        onClick={() => {
                            setUrl(
                                (editor.getAttributes('link').href as
                                    | string
                                    | undefined) ?? '',
                            );
                            setLinking(true);
                        }}
                    >
                        <Link2 />
                    </ToolbarButton>
                </>
            )}
        </div>
    );
}

export function ToolbarButton({
    label,
    active,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            data-active={active || undefined}
            // Keep focus (and the selection) in the field.
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
