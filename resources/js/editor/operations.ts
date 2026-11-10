import { emptyItem, emptySection, newId, SINGLE_ITEM_TYPES } from '@/schema';
import type { Column, ResumeContent, Section, SectionType } from '@/schema';

/**
 * Pure, immutable edits on resume content. The store wraps these so every
 * change goes through one place (and one undo history).
 */

type AnyItem = Record<string, unknown> & { id: string };

const items = (section: Section) => section.items as unknown as AnyItem[];

function mapSection(
    content: ResumeContent,
    sectionId: string,
    fn: (section: Section) => Section,
): ResumeContent {
    return {
        ...content,
        sections: content.sections.map((section) =>
            section.id === sectionId ? fn(section) : section,
        ),
    };
}

function withItems(section: Section, next: AnyItem[]): Section {
    return { ...section, items: next } as unknown as Section;
}

export function setItemField(
    content: ResumeContent,
    sectionId: string,
    itemId: string,
    key: string,
    value: unknown,
): ResumeContent {
    return mapSection(content, sectionId, (section) =>
        withItems(
            section,
            items(section).map((item) =>
                item.id === itemId ? { ...item, [key]: value } : item,
            ),
        ),
    );
}

export function updateSection(
    content: ResumeContent,
    sectionId: string,
    patch: Partial<Pick<Section, 'title' | 'column' | 'pageBreakBefore'>> & {
        settings?: Record<string, unknown>;
    },
): ResumeContent {
    return mapSection(content, sectionId, (section) => {
        const { settings, ...rest } = patch;

        return {
            ...section,
            ...rest,
            settings: settings
                ? { ...section.settings, ...settings }
                : section.settings,
        } as Section;
    });
}

/** Insert a new empty item after `afterId` (or at the end). Returns the new id too. */
export function addItem(
    content: ResumeContent,
    sectionId: string,
    afterId?: string,
): [ResumeContent, string] {
    const section = content.sections.find((s) => s.id === sectionId);

    if (!section || SINGLE_ITEM_TYPES.includes(section.type)) {
        return [content, ''];
    }

    const item = emptyItem(section.type) as unknown as AnyItem;
    const list = [...items(section)];
    const index = afterId
        ? list.findIndex((i) => i.id === afterId) + 1
        : list.length;
    list.splice(index || list.length, 0, item);

    return [mapSection(content, sectionId, (s) => withItems(s, list)), item.id];
}

export function duplicateItem(
    content: ResumeContent,
    sectionId: string,
    itemId: string,
): ResumeContent {
    return mapSection(content, sectionId, (section) => {
        const list = [...items(section)];
        const index = list.findIndex((item) => item.id === itemId);

        if (index === -1 || SINGLE_ITEM_TYPES.includes(section.type)) {
            return section;
        }

        list.splice(index + 1, 0, {
            ...structuredClone(list[index]),
            id: newId(),
        });

        return withItems(section, list);
    });
}

export function removeItem(
    content: ResumeContent,
    sectionId: string,
    itemId: string,
): ResumeContent {
    return mapSection(content, sectionId, (section) =>
        SINGLE_ITEM_TYPES.includes(section.type)
            ? section
            : withItems(
                  section,
                  items(section).filter((item) => item.id !== itemId),
              ),
    );
}

export function moveItem(
    content: ResumeContent,
    sectionId: string,
    from: number,
    to: number,
): ResumeContent {
    return mapSection(content, sectionId, (section) =>
        withItems(section, move(items(section), from, to)),
    );
}

export function addSection(
    content: ResumeContent,
    type: SectionType,
    column: Column,
    afterId?: string,
): [ResumeContent, string] {
    if (
        type === 'header' ||
        (type === 'summary' &&
            content.sections.some((s) => s.type === 'summary'))
    ) {
        return [content, ''];
    }

    const section = emptySection(type, column);
    const sections = [...content.sections];
    const index = afterId
        ? sections.findIndex((s) => s.id === afterId) + 1
        : sections.length;
    sections.splice(index || sections.length, 0, section);

    return [{ ...content, sections }, section.id];
}

export function removeSection(
    content: ResumeContent,
    sectionId: string,
): ResumeContent {
    return {
        ...content,
        sections: content.sections.filter(
            (section) => section.id !== sectionId || section.type === 'header',
        ),
    };
}

/** Move a section among the sections of its own column, by one step. */
export function shiftSection(
    content: ResumeContent,
    sectionId: string,
    direction: -1 | 1,
    columnAware: boolean,
): ResumeContent {
    const sections = content.sections;
    const index = sections.findIndex((s) => s.id === sectionId);
    const section = sections[index];

    if (!section || section.type === 'header') {
        return content;
    }

    const sameColumn = (s: Section) =>
        s.type !== 'header' && (!columnAware || s.column === section.column);
    let target = index + direction;

    while (
        target > 0 &&
        target < sections.length &&
        !sameColumn(sections[target])
    ) {
        target += direction;
    }

    if (target <= 0 || target >= sections.length) {
        return content;
    }

    return { ...content, sections: move(sections, index, target) };
}

export function move<T>(list: T[], from: number, to: number): T[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    return next;
}
