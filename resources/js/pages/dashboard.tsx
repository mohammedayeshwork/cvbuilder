import { Head } from '@inertiajs/react';
import { FileText, Mail, Plus } from 'lucide-react';
import { useState } from 'react';
import { DeleteDialog } from '@/components/documents/delete-dialog';
import { DocumentCard } from '@/components/documents/document-card';
import { RenameDialog } from '@/components/documents/rename-dialog';
import { TemplatePicker } from '@/components/documents/template-picker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import type { DocumentType } from '@/schema';
import type { CvDocument } from '@/types';

const TABS: {
    type: DocumentType;
    label: string;
    empty: string;
    icon: typeof FileText;
}[] = [
    {
        type: 'resume',
        label: 'Resumes',
        empty: 'You have no resumes yet.',
        icon: FileText,
    },
    {
        type: 'cover_letter',
        label: 'Cover letters',
        empty: 'You have no cover letters yet.',
        icon: Mail,
    },
];

export default function Dashboard({ documents }: { documents: CvDocument[] }) {
    const [tab, setTab] = useState<DocumentType>('resume');
    const [picking, setPicking] = useState<DocumentType | null>(null);
    const [renaming, setRenaming] = useState<CvDocument | null>(null);
    const [deleting, setDeleting] = useState<CvDocument | null>(null);

    return (
        <>
            <Head title="My documents" />
            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as DocumentType)}
                className="flex-1 gap-6 p-4 md:p-6"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <TabsList>
                        {TABS.map(({ type, label, icon: Icon }) => (
                            <TabsTrigger key={type} value={type}>
                                <Icon /> {label}
                                <span className="text-xs text-muted-foreground">
                                    {
                                        documents.filter((d) => d.type === type)
                                            .length
                                    }
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <Button onClick={() => setPicking(tab)}>
                        <Plus /> New{' '}
                        {tab === 'resume' ? 'resume' : 'cover letter'}
                    </Button>
                </div>

                {TABS.map(({ type, empty }) => {
                    const list = documents.filter((d) => d.type === type);

                    return (
                        <TabsContent key={type} value={type}>
                            {list.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                                    <p className="text-muted-foreground">
                                        {empty}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPicking(type)}
                                    >
                                        <Plus /> Create one
                                    </Button>
                                </div>
                            ) : (
                                <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
                                    {list.map((document) => (
                                        <li key={document.id}>
                                            <DocumentCard
                                                document={document}
                                                onRename={setRenaming}
                                                onDelete={setDeleting}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </TabsContent>
                    );
                })}
            </Tabs>

            <TemplatePicker
                type={picking}
                onOpenChange={(open) => !open && setPicking(null)}
            />
            <RenameDialog
                document={renaming}
                onOpenChange={(open) => !open && setRenaming(null)}
            />
            <DeleteDialog
                document={deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
            />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'My documents',
            href: dashboard(),
        },
    ],
};
