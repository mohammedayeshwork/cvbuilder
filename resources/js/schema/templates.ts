/**
 * Template keys known to the server. The template registry
 * (resources/js/templates/registry.ts) must provide each of these.
 */
export const TEMPLATE_KEYS = [
    'classic',
    'modern-split',
    'bold-header',
    'minimal',
    'timeline',
    'compact',
] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const DOCUMENT_TYPES = ['resume', 'cover_letter'] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
