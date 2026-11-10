import { PageFrame } from '@/renderer/PageFrame';
import { ContactList, Field, Photo } from '@/renderer/primitives';
import type { PageProps } from '../types';

/** Name and title on the left, contact details stacked on the right. */
export function Header() {
    return (
        <div className="ms-header">
            <Photo className="ms-photo" />
            <div className="ms-identity">
                <h1 className="ms-name">
                    <Field name="name" />
                </h1>
                <Field name="title" className="ms-title" />
            </div>
            <ContactList icons className="ms-contact" />
        </div>
    );
}

/** Main column and a tinted sidebar that runs to the bottom of every page. */
export function Page({ header, main, side, index }: PageProps) {
    return (
        <PageFrame index={index} className="ms-page">
            {header}
            <div className="cv-columns ms-columns" data-side="end">
                <div className="cv-main">{main}</div>
                <div className="cv-side ms-side">{side}</div>
            </div>
        </PageFrame>
    );
}
