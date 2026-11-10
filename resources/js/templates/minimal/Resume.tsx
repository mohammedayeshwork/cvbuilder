import { PageFrame } from '@/renderer/PageFrame';
import { ContactList, Field, Photo } from '@/renderer/primitives';
import type { PageProps } from '../types';

/** The name in small caps, then contact details on one quiet line. */
export function Header() {
    return (
        <div className="mn-header">
            <div>
                <h1 className="mn-name">
                    <Field name="name" />
                </h1>
                <Field name="title" className="mn-title" />
                <ContactList className="mn-contact" />
            </div>
            <Photo className="mn-photo" />
        </div>
    );
}

/** Section titles sit in a narrow gutter beside their content. */
export function Page({ header, main, index }: PageProps) {
    return (
        <PageFrame index={index}>
            {header}
            {main}
        </PageFrame>
    );
}
