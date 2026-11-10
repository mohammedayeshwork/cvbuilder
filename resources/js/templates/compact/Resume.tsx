import { PageFrame } from '@/renderer/PageFrame';
import { ContactList, Field, Photo } from '@/renderer/primitives';
import type { PageProps } from '../types';

/** Name and title on one line, contact details right under them. */
export function Header() {
    return (
        <div className="cp-header">
            <Photo className="cp-photo" />
            <div className="cp-identity">
                <h1 className="cp-name-line">
                    <Field name="name" className="cp-name" />
                    <Field name="title" className="cp-title" />
                </h1>
                <ContactList icons className="cp-contact" />
            </div>
        </div>
    );
}

/** A narrow sidebar on the inline start, separated by a thin rule. */
export function Page({ header, main, side, index }: PageProps) {
    return (
        <PageFrame index={index} className="cp-page">
            {header}
            <div className="cv-columns cp-columns" data-side="start">
                <div className="cv-main">{main}</div>
                <div className="cv-side cp-side">{side}</div>
            </div>
        </PageFrame>
    );
}
