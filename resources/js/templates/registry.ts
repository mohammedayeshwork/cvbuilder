import type { TemplateKey } from '@/schema';
import classic from './classic';
import type { TemplateDefinition } from './types';

/** Every template. Adding one means adding its folder and one line here. */
export const TEMPLATES: Partial<Record<TemplateKey, TemplateDefinition>> = {
    classic,
};

export function getTemplate(key: string): TemplateDefinition {
    return TEMPLATES[key as TemplateKey] ?? classic;
}
