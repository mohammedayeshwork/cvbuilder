import { PageFrame } from '@/renderer/PageFrame';
import { ContactList, Field, Photo } from '@/renderer/primitives';
import type { PageProps } from '../types';

/** Centered name over a thin rule, contact details on one line. */
export function Header() {
    return (
        <div className="cl-header">
            <Photo className="cl-photo" />
            <div className="cl-header-text">
                <h1 className="cl-name">
                    <Field name="name" />
                </h1>
                <Field name="title" className="cl-title" />
                <ContactList only="details" className="cl-contact" />
                <ContactList only="links" className="cl-contact cl-links" />
            </div>
        </div>
    );
}

export function Page({ header, main, index }: PageProps) {
    return (
        <PageFrame index={index}>
            {header}
            {main}
        </PageFrame>
    );
}
