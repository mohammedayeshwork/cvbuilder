/**
 * Writes the JSON Schema files the backend validates against.
 *
 *   npm run schema:export          write resources/schema/*.json
 *   npm run schema:export -- --check   fail if the committed files are stale (CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
    CoverLetterContent,
    DesignOverrides,
    DOCUMENT_TYPES,
    ResumeContent,
    RichText,
    SECTION_SCHEMAS,
    SECTION_TYPES,
    TEMPLATE_KEYS,
} from '../resources/js/schema';

const outDir = resolve(import.meta.dirname, '../resources/schema');
const check = process.argv.includes('--check');

/** Field names that hold rich text anywhere in a document. */
function richTextKeys(): string[] {
    const shapes = [
        ...Object.values(SECTION_SCHEMAS).map(
            (s) => s.item.shape as Record<string, z.ZodType>,
        ),
        CoverLetterContent.shape as Record<string, z.ZodType>,
    ];
    const keys = new Set<string>();

    for (const shape of shapes) {
        for (const [key, field] of Object.entries(shape)) {
            if (field === RichText) {
                keys.add(key);
            }
        }
    }

    return [...keys].sort();
}

type Node = Record<string, unknown>;

/**
 * Zod emits discriminated unions as `oneOf`, which reports every branch as
 * failing. Rewrite them as `if type = X then <branch>` so validation errors
 * point at the field that is actually wrong.
 */
function discriminate(node: unknown): unknown {
    if (Array.isArray(node)) {
        return node.map(discriminate);
    }

    if (typeof node !== 'object' || node === null) {
        return node;
    }

    const out: Node = Object.fromEntries(
        Object.entries(node).map(([key, value]) => [key, discriminate(value)]),
    );
    const branches = out.oneOf as Node[] | undefined;
    const typeOf = (branch: Node) =>
        ((branch.properties as Node | undefined)?.type as Node | undefined)
            ?.const;

    if (
        branches &&
        branches.every((branch) => typeof typeOf(branch) === 'string')
    ) {
        delete out.oneOf;
        out.type = 'object';
        out.required = ['type'];
        out.properties = { type: { enum: branches.map(typeOf) } };
        out.allOf = branches.map((branch) => ({
            if: { properties: { type: { const: typeOf(branch) } } },
            // oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
            then: branch,
        }));
    }

    return out;
}

const jsonSchema = (schema: z.ZodType, id: string) => ({
    $id: `https://cvbuilder.local/schema/${id}.json`,
    ...(discriminate(
        z.toJSONSchema(schema, {
            target: 'draft-2020-12',
            unrepresentable: 'throw',
        }),
    ) as Node),
});

const files: Record<string, unknown> = {
    'resume.json': jsonSchema(ResumeContent, 'resume'),
    'cover-letter.json': jsonSchema(CoverLetterContent, 'cover-letter'),
    'design.json': jsonSchema(DesignOverrides, 'design'),
    'meta.json': {
        documentTypes: DOCUMENT_TYPES,
        templates: TEMPLATE_KEYS,
        sectionTypes: SECTION_TYPES,
        richTextKeys: richTextKeys(),
    },
};

let stale = 0;

for (const [name, data] of Object.entries(files)) {
    const path = resolve(outDir, name);
    const json = `${JSON.stringify(data, null, 2)}\n`;

    if (check) {
        let current = '';
        try {
            current = readFileSync(path, 'utf8');
        } catch {
            // missing counts as stale
        }
        if (current !== json) {
            console.error(`stale: resources/schema/${name}`);
            stale++;
        }
    } else {
        writeFileSync(path, json);
        console.log(`wrote resources/schema/${name}`);
    }
}

if (stale > 0) {
    console.error('Run `npm run schema:export` and commit the result.');
    process.exit(1);
}
