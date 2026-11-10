import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    LayoutPanelLeft,
    Palette,
    Redo2,
    Undo2,
} from 'lucide-react';
import { useState } from 'react';
import { PageCount } from '@/editor/components/PageCount';
import { DesignPanel } from '@/editor/design/DesignPanel';
import { RearrangePanel } from '@/editor/rearrange/RearrangePanel';
import type { LayoutInfo } from '@/renderer/DocumentRenderer';
import { Button } from '@/components/ui/button';
import { useAutosave } from '@/editor/autosave';
import { useEditBindings } from '@/editor/bindings';
import { AddSectionDialog } from '@/editor/components/AddSectionDialog';
import { ConflictDialog } from '@/editor/components/ConflictDialog';
import { SaveIndicator } from '@/editor/components/SaveIndicator';
import { TitleField } from '@/editor/components/TitleField';
import { EditorStoreProvider, useEditor, useHistory } from '@/editor/context';
import '@/editor/editor.css';
import { useUndoShortcuts } from '@/editor/shortcuts';
import { createEditorStore } from '@/editor/store';
import { DocumentRenderer } from '@/renderer/DocumentRenderer';
import { EditProvider } from '@/renderer/edit';
import { dashboard } from '@/routes';
import documents from '@/routes/documents';
import type { CvDocument } from '@/types';

export default function Edit({ document }: { document: CvDocument }) {
    const [store] = useState(() =>
        createEditorStore({
            type: document.type,
            template_key: document.template_key,
            content: document.content,
            design: document.design,
        }),
    );
    const { status, error } = useAutosave(
        store,
        documents.update.url(document),
        document.revision,
    );
    useUndoShortcuts(store);
    const [panel, setPanel] = useState<'design' | 'rearrange' | null>(null);
    const toggle = (name: 'design' | 'rearrange') =>
        setPanel((open) => (open === name ? null : name));
    const [layout, setLayout] = useState<LayoutInfo>({
        pages: 1,
        plan: [],
        oversized: [],
    });

    return (
        <EditorStoreProvider value={store}>
            <Head title={document.title} />
            <div className="flex min-h-svh flex-col bg-muted">
                <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={dashboard()} aria-label="Back to documents">
                            <ArrowLeft />
                            <span className="max-md:sr-only">Documents</span>
                        </Link>
                    </Button>
                    <TitleField id={document.id} initial={document.title} />
                    <SaveIndicator status={status} error={error} />
                    <PageCount layout={layout} />
                    <div className="ms-auto flex items-center gap-1">
                        <HistoryButtons />
                        <Button
                            size="sm"
                            variant={panel === 'design' ? 'default' : 'outline'}
                            aria-pressed={panel === 'design'}
                            onClick={() => toggle('design')}
                        >
                            <Palette />
                            <span className="max-sm:sr-only">Design</span>
                        </Button>
                        {document.type === 'resume' && (
                            <>
                                <Button
                                    size="sm"
                                    variant={
                                        panel === 'rearrange'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    aria-pressed={panel === 'rearrange'}
                                    onClick={() => toggle('rearrange')}
                                >
                                    <LayoutPanelLeft />
                                    <span className="max-sm:sr-only">
                                        Rearrange
                                    </span>
                                </Button>
                                <AddSectionDialog />
                            </>
                        )}
                    </div>
                </header>
                <main className="flex flex-1 flex-col items-center gap-8 overflow-x-auto px-4 py-10 sm:px-16 lg:flex-row lg:items-start lg:justify-center">
                    {panel && (
                        <div className="lg:sticky lg:top-0 lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto lg:pe-2">
                            {panel === 'rearrange' ? (
                                <RearrangePanel plan={layout.plan} />
                            ) : (
                                <DesignPanel />
                            )}
                        </div>
                    )}
                    <Canvas
                        onLayout={setLayout}
                        editable={panel !== 'rearrange'}
                    />
                </main>
            </div>
            <ConflictDialog open={status === 'conflict'} />
        </EditorStoreProvider>
    );
}

function Canvas({
    onLayout,
    editable,
}: {
    onLayout: (info: LayoutInfo) => void;
    editable: boolean;
}) {
    const bindings = useEditBindings();
    const type = useEditor((state) => state.type);
    const content = useEditor((state) => state.content);
    const design = useEditor((state) => state.design);
    const templateKey = useEditor((state) => state.template_key);

    return (
        <div className="cv-paper-stack h-fit">
            <EditProvider value={bindings}>
                <DocumentRenderer
                    document={{
                        type,
                        template_key: templateKey,
                        content,
                        design,
                    }}
                    mode={type === 'resume' && editable ? 'edit' : 'view'}
                    onLayout={onLayout}
                />
            </EditProvider>
        </div>
    );
}

function HistoryButtons() {
    const { canUndo, canRedo, undo, redo } = useHistory();

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
            >
                <Undo2 />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo2 />
            </Button>
        </>
    );
}
