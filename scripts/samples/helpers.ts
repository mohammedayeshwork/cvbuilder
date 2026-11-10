import {
    DEFAULT_SETTINGS,
    DEFAULT_TITLES,
    emptyItem,
    RESUME_VERSION,
} from '../../resources/js/schema';
import type {
    Column,
    DesignOverrides,
    ItemOf,
    ResumeContent,
    Section,
    SectionType,
    SettingsOf,
    TemplateKey,
} from '../../resources/js/schema';

export interface Sample {
    key: TemplateKey;
    title: string;
    content: ResumeContent;
    design: DesignOverrides;
}

type ItemInput<T extends SectionType> = Partial<
    Omit<ItemOf<T>, 'id' | 'links'>
> & {
    links?: { label: string; url: string }[];
};

interface SectionOptions<T extends SectionType> {
    title?: string;
    column?: Column;
    pageBreakBefore?: boolean;
    settings?: Partial<SettingsOf<T>>;
}

/** Builds sections with stable ids ("<prefix>-0001", ...) so samples diff cleanly. */
export function persona(prefix: string) {
    let n = 0;
    const id = () => `${prefix}-${String(++n).padStart(4, '0')}`;

    function section<T extends SectionType>(
        type: T,
        items: ItemInput<T>[],
        options: SectionOptions<T> = {},
    ): Section {
        const sectionId = id();

        return {
            id: sectionId,
            type,
            title: options.title ?? DEFAULT_TITLES[type],
            column: options.column ?? 'main',
            pageBreakBefore: options.pageBreakBefore ?? false,
            settings: { ...DEFAULT_SETTINGS[type], ...options.settings },
            items: items.map((item) => {
                const base = emptyItem(type) as Record<string, unknown>;
                const full = { ...base, ...item, id: id() } as Record<
                    string,
                    unknown
                >;

                if (Array.isArray(full.links)) {
                    full.links = (
                        full.links as { label: string; url: string }[]
                    ).map((link) => ({
                        id: id(),
                        label: link.label,
                        url: link.url,
                    }));
                }

                return full;
            }),
        } as unknown as Section;
    }

    const resume = (...sections: Section[]): ResumeContent => ({
        version: RESUME_VERSION,
        sections,
    });

    return { section, resume };
}

/** "<ul><li>a</li><li>b</li></ul>" */
export const bullets = (...lines: string[]): string =>
    `<ul>${lines.map((line) => `<li>${line}</li>`).join('')}</ul>`;

export const para = (...lines: string[]): string =>
    lines.map((line) => `<p>${line}</p>`).join('');
