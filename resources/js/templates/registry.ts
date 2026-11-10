import type { TemplateKey } from '@/schema';
import boldHeader from './bold-header';
import classic from './classic';
import compact from './compact';
import minimal from './minimal';
import modernSplit from './modern-split';
import timeline from './timeline';
import type { TemplateDefinition } from './types';

/** Every template. Adding one means adding its folder and one line here. */
export const TEMPLATES: Record<TemplateKey, TemplateDefinition> = {
    classic,
    'modern-split': modernSplit,
    'bold-header': boldHeader,
    minimal,
    timeline,
    compact,
};

export function getTemplate(key: string): TemplateDefinition {
    return TEMPLATES[key as TemplateKey] ?? classic;
}
