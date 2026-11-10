import { COVER_LETTER_VERSION } from './cover-letter';
import { DESIGN_VERSION } from './design';
import { RESUME_VERSION } from './resume';
import type { DocumentType } from './templates';

type Json = Record<string, unknown>;
type Step = (doc: Json) => Json;

/**
 * Upgrade steps keyed by the version they upgrade FROM.
 * Mirror every step in app/Documents/ContentMigrator.php.
 */
const STEPS: Record<DocumentType | 'design', Record<number, Step>> = {
    resume: {},
    cover_letter: {},
    design: {},
};

const LATEST: Record<DocumentType | 'design', number> = {
    resume: RESUME_VERSION,
    cover_letter: COVER_LETTER_VERSION,
    design: DESIGN_VERSION,
};

export function migrate(kind: DocumentType | 'design', input: unknown): Json {
    let doc: Json = isObject(input) ? { ...input } : {};
    let version = typeof doc.version === 'number' ? doc.version : 1;

    while (version < LATEST[kind]) {
        const step = STEPS[kind][version];

        if (!step) {
            throw new Error(`No ${kind} migration from v${version}`);
        }

        doc = step(doc);
        version++;
    }

    return { ...doc, version };
}

function isObject(value: unknown): value is Json {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
