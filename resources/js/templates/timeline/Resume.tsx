import { PageFrame } from '@/renderer/PageFrame';
import { ContactList, Field, Photo } from '@/renderer/primitives';
import type { PageProps } from '../types';

/** Name and title beside an accent bar, contact details with icons below. */
export function Header() {
    return (
        <div className="tl-header">
            <Photo className="tl-photo" />
            <div className="tl-identity">
                <h1 className="tl-name">
                    <Field name="name" />
                </h1>
                <Field name="title" className="tl-title" />
                <ContactList icons className="tl-contact" />
            </div>
        </div>
    );
}

export function Page({ header, main, index }: PageProps) {
    return (
        <PageFrame index={index} className="tl-page">
            {header}
            {main}
        </PageFrame>
    );
}
