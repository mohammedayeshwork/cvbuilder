import type { DesignOverrides, ResumeContent, TemplateKey } from '@/schema';
import { templateInfo } from '@/templates/catalog';

/** Add or change design overrides. `undefined` removes one (back to the template default). */
export function setDesign(
    design: DesignOverrides,
    patch: Partial<DesignOverrides>,
): DesignOverrides {
    const next: DesignOverrides = { ...design };

    for (const [key, value] of Object.entries(patch) as [
        keyof DesignOverrides,
        unknown,
    ][]) {
        if (value === undefined) {
            delete next[key];
        } else if (key === 'sectionTitle') {
            next.sectionTitle = {
                ...design.sectionTitle,
                ...(value as DesignOverrides['sectionTitle']),
            };
        } else {
            (next as Record<string, unknown>)[key] = value;
        }
    }

    return next;
}

/** "Reset": drop every override. */
export const resetDesign = (design: DesignOverrides): DesignOverrides => ({
    version: design.version,
});

/** Size presets set font size, line height, spacing and margins together. */
export const SIZE_PRESETS = {
    compact: {
        fontSize: 9.5,
        lineHeight: 1.25,
        sectionSpacing: 0.8,
        pageMargin: 12,
    },
    normal: {
        fontSize: undefined,
        lineHeight: undefined,
        sectionSpacing: undefined,
        pageMargin: undefined,
    },
    spacious: {
        fontSize: 11,
        lineHeight: 1.5,
        sectionSpacing: 1.25,
        pageMargin: 20,
    },
} satisfies Record<string, Partial<DesignOverrides>>;

/**
 * Switching to a two-column template when nothing is in a sidebar yet puts
 * sections where that template expects them. Otherwise the user's own
 * column choices are kept. Content is never changed otherwise.
 */
export function switchTemplate(
    content: ResumeContent,
    key: TemplateKey,
): ResumeContent {
    const target = templateInfo(key);

    if (
        target.layout !== 'two-column' ||
        content.sections.some((s) => s.type !== 'header' && s.column === 'side')
    ) {
        return content;
    }

    return {
        ...content,
        sections: content.sections.map((section) => {
            const column = target.columns[section.type] ?? 'main';
            return section.column === column ? section : { ...section, column };
        }),
    };
}
