import type { ComponentType, ReactNode } from 'react';
import type { Design, ResumeContent } from '@/schema';
import type { TemplateInfo } from './catalog';

export type EntryLayout = 'stacked' | 'inline' | 'timeline';

export interface PageProps {
    /** Present on the first page only. */
    header: ReactNode;
    main: ReactNode;
    /** Empty for single-column templates, which put every section in main. */
    side: ReactNode;
    index: number;
}

export interface TemplateDefinition {
    info: TemplateInfo;
    /** The complete default design; user overrides are merged on top. */
    design: Design;
    entryLayout: EntryLayout;
    /** Renders the header section's single item (via header primitives). */
    Header: ComponentType;
    /** Arranges one page: header band, columns and decorations. */
    Page: ComponentType<PageProps>;
    thumbnail: TemplateThumbnail;
}

export interface TemplateThumbnail {
    /** Sample content shown in the template picker. */
    sample: { title: string; content: ResumeContent };
}
