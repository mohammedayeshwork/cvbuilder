/**
 * Validates the sample personas in scripts/samples and writes them to
 * resources/samples/<template>.json, where both the template picker and the
 * PHP seeders read them.
 *
 *   npm run samples:build               write the files
 *   npm run samples:build -- --check    fail if the committed files are stale (CI)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    DesignOverrides,
    ResumeContent,
    TEMPLATE_KEYS,
} from '../resources/js/schema';
import boldHeader from './samples/bold-header';
import classic from './samples/classic';
import compact from './samples/compact';
import type { Sample } from './samples/helpers';
import minimal from './samples/minimal';
import modernSplit from './samples/modern-split';
import timeline from './samples/timeline';

const samples: Sample[] = [
    classic,
    modernSplit,
    boldHeader,
    minimal,
    timeline,
    compact,
];
const outDir = resolve(import.meta.dirname, '../resources/samples');
const check = process.argv.includes('--check');
let failed = 0;

mkdirSync(outDir, { recursive: true });

for (const key of TEMPLATE_KEYS) {
    if (!samples.some((sample) => sample.key === key)) {
        console.error(`missing sample for template "${key}"`);
        failed++;
    }
}

for (const sample of samples) {
    const content = ResumeContent.safeParse(sample.content);
    const design = DesignOverrides.safeParse(sample.design);

    for (const result of [content, design]) {
        if (!result.success) {
            console.error(
                `${sample.key}: ${JSON.stringify(result.error.issues, null, 2)}`,
            );
            failed++;
        }
    }

    const path = resolve(outDir, `${sample.key}.json`);
    const json = `${JSON.stringify(
        {
            title: sample.title,
            template_key: sample.key,
            content: sample.content,
            design: sample.design,
        },
        null,
        2,
    )}\n`;

    if (check) {
        let current = '';
        try {
            current = readFileSync(path, 'utf8');
        } catch {
            // missing counts as stale
        }
        if (current !== json) {
            console.error(`stale: resources/samples/${sample.key}.json`);
            failed++;
        }
    } else {
        writeFileSync(path, json);
        console.log(`wrote resources/samples/${sample.key}.json`);
    }
}

if (failed > 0) {
    if (check) {
        console.error('Run `npm run samples:build` and commit the result.');
    }
    process.exit(1);
}
