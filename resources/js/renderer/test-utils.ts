import type { Design, ResumeContent } from '@/schema';
import { SECTION_FIELDS } from '@/sections/fields';
import { PROFICIENCY_LABELS } from '@/sections/languages/fields';
import { displayUrl, formatPartialDate } from './format';

/** The text runs between tags. */
export const runs = (html: string) =>
    html
        .split(/<[^>]+>/)
        .map((run) => run.replace(/&amp;/g, '&').trim())
        .filter(Boolean);

export const plain = (html: string) => runs(html).join(' ');

/** Every piece of text a sample should show, given its section settings. */
export function expectedTexts(
    content: ResumeContent,
    dateFormat: Design['dateFormat'] = 'MMM YYYY',
): string[] {
    const texts: string[] = [];

    for (const section of content.sections) {
        if (section.type !== 'header') {
            texts.push(section.title);
        }
        if (section.type === 'references' && section.settings.onRequestOnly) {
            continue;
        }
        const settings = section.settings as Record<string, unknown>;

        for (const item of section.items as Record<string, unknown>[]) {
            for (const field of SECTION_FIELDS[section.type].fields) {
                const value = item[field.key];
                if (field.toggle && settings[field.toggle] === false) continue;

                if (field.kind === 'date' && typeof value === 'string')
                    texts.push(formatPartialDate(value, dateFormat));
                else if (
                    field.kind === 'url' &&
                    typeof value === 'string' &&
                    value
                )
                    texts.push(displayUrl(value));
                else if (field.kind === 'rich' && typeof value === 'string')
                    texts.push(...runs(value));
                else if (
                    field.kind === 'proficiency' &&
                    section.settings &&
                    settings.display === 'text'
                )
                    texts.push(
                        PROFICIENCY_LABELS[
                            value as keyof typeof PROFICIENCY_LABELS
                        ],
                    );
                else if (
                    field.kind === 'keywords' &&
                    Array.isArray(value) &&
                    section.type === 'skills' &&
                    settings.display === 'grouped'
                )
                    texts.push(...(value as string[]));
                else if (field.kind === 'links' && Array.isArray(value))
                    texts.push(
                        ...(value as { label: string }[]).map(
                            (link) => link.label,
                        ),
                    );
                else if (
                    ['text', 'email', 'phone'].includes(field.kind) &&
                    typeof value === 'string'
                )
                    texts.push(value);
            }
        }
    }

    return texts.filter((text) => text.trim() !== '');
}
