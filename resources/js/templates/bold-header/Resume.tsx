import { PageFrame } from '@/renderer/PageFrame';
import { ContactList, Field, Photo } from '@/renderer/primitives';
import type { PageProps } from '../types';

/** A full-bleed band in the accent color with the name in white. */
export function Header() {
    return (
        <div className="bh-band">
            <div className="bh-identity">
                <h1 className="bh-name">
                    <Field name="name" />
                </h1>
                <Field name="title" className="bh-title" />
                <ContactList icons className="bh-contact" />
            </div>
            <Photo className="bh-photo" />
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
