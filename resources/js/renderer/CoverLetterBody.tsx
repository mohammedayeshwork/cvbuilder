import type { CoverLetterContent } from '@/schema';
import { isBlank } from './format';
import { RichText } from './primitives';

function formatLetterDate(iso: string): string {
    if (iso === '') {
        return '';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${iso}T00:00:00Z`));
}

/** Date, recipient, greeting, body and sign-off of a cover letter. */
export function CoverLetterBody({ content }: { content: CoverLetterContent }) {
    const { recipient } = content;
    const recipientLines = [
        recipient.name,
        recipient.title,
        recipient.company,
        ...recipient.address.split('\n'),
    ].filter((line) => !isBlank(line));

    return (
        <div className="cv-letter">
            {content.date && (
                <p className="cv-letter-date">
                    {formatLetterDate(content.date)}
                </p>
            )}
            {recipientLines.length > 0 && (
                <address className="cv-letter-recipient">
                    {recipientLines.map((line, i) => (
                        <span key={i}>{line}</span>
                    ))}
                </address>
            )}
            {content.greeting && (
                <p className="cv-letter-greeting">{content.greeting}</p>
            )}
            <RichText html={content.body} className="cv-letter-body" />
            {content.closing && (
                <p className="cv-letter-closing">{content.closing}</p>
            )}
            {content.signature && (
                <p className="cv-letter-signature">{content.signature}</p>
            )}
        </div>
    );
}
