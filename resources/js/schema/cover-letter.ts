import { z } from 'zod';
import { RichText, Text } from './common';
import { HeaderFields } from './sections';

export const COVER_LETTER_VERSION = 1;

export const CoverLetterContent = z.strictObject({
    version: z.literal(COVER_LETTER_VERSION),
    /** Ignored and taken from the resume while the letter is linked. */
    sender: z.strictObject(HeaderFields),
    /** ISO date "YYYY-MM-DD", or empty. */
    date: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
    recipient: z.strictObject({
        name: Text(120),
        title: Text(),
        company: Text(),
        address: Text(400),
    }),
    greeting: Text(),
    body: RichText,
    closing: Text(),
    signature: Text(120),
});

export type CoverLetterContent = z.infer<typeof CoverLetterContent>;
