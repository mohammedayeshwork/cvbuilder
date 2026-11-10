import { z } from 'zod';
import { Section } from './sections';
import type { HeaderItem } from './sections';

export const RESUME_VERSION = 1;

export const ResumeContent = z.strictObject({
    version: z.literal(RESUME_VERSION),
    sections: z.array(Section).min(1).max(40),
});

export type ResumeContent = z.infer<typeof ResumeContent>;

/** The resume's header entry (name, contact details, photo). */
export function headerItem(content: ResumeContent): HeaderItem | undefined {
    const header = content.sections.find(
        (section) => section.type === 'header',
    );

    return header?.items[0];
}
