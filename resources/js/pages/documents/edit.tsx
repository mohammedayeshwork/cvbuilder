import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { dashboard } from '@/routes';
import type { CvDocument } from '@/types';

/** Placeholder until the canvas editor lands. */
export default function Edit({ document }: { document: CvDocument }) {
    return (
        <>
            <Head title={document.title} />
            <div className="flex min-h-svh flex-col bg-muted">
                <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" /> Documents
                    </Link>
                    <h1 className="truncate font-medium">{document.title}</h1>
                </header>
                <main className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
                    The editor for this document is on its way.
                </main>
            </div>
        </>
    );
}
