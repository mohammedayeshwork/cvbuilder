# CV Builder

A resume and cover letter builder: click-to-edit pages on a canvas, drag-and-drop sections, six original templates with matching cover letters, design controls, and PDFs that match the preview exactly.

Laravel 13 + Fortify (auth) + Socialite (Google) · Inertia v3 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Wayfinder · Vite+ (`vp`) · Pest.

## Hard rules

- **No AI features.** Do not add AI/LLM packages, SDKs, API calls, environment variables or "generate"/"rewrite with AI" UI. This also covers suggestions and autocompletion that call a model.
- **Templates are original.** Do not copy the look, names or assets of existing resume products.
- **One render path.** Editor, thumbnails, template picker, share page, mobile preview and PDF all use `DocumentRenderer`. Never build a second renderer for the PDF.
- **The Zod schemas are the source of truth** for document JSON. Change `resources/js/schema/*`, then run `npm run schema:export` and commit the regenerated `resources/schema/*.json`. Never edit those JSON files by hand.
- Schema changes that break stored documents need a version bump plus a migration step in **both** `resources/js/schema/migrations.ts` and `app/Documents/ContentMigrator.php`.
- Every document route goes through `DocumentPolicy` (`->can(...)` on the route). Other users get 403.
- After each meaningful change: conventional commit, then push. `git status` must be clean and `git log origin/main..HEAD` empty before reporting work as done.

## Commands

```bash
composer dev                 # server, queue, logs and Vite
php artisan test --compact   # Pest
npm run types:check          # tsc
npm run check                # Vite+ format + lint (use check:fix to apply)
npm run schema:export        # Zod -> resources/schema/*.json   (schema:check in CI)
npm run samples:build        # scripts/samples -> resources/samples/*.json (samples:check in CI)
php artisan migrate:fresh --seed   # demo@example.com / password with sample documents
```

Run from a normal host terminal. The VS Code Flatpak sandbox has no PHP or Chromium.

## Where things live

- `resources/js/schema/`: Zod schemas, inferred types, `defaults.ts` (empty document and item factories), `migrations.ts`.
- `resources/schema/*.json`: generated JSON Schema plus `meta.json` (template keys, section types, rich text field names) that PHP reads.
- `resources/samples/*.json`: one sample persona per template, built from `scripts/samples/*.ts`. The picker, thumbnails, seeders and tests all use them.
- `app/Documents/`: `DocumentValidator` (opis JSON Schema, extra rules, photo checks, sanitizing), `RichTextSanitizer`, `ContentMigrator`.
- `resources/js/templates/catalog.ts`: template names, layouts and default columns.

## Conventions

- Document `content` and `design` are cast with `App\Casts\JsonObject` and come back as `stdClass`, **not arrays**, so empty objects (`settings: {}`) survive. Read request bodies with `json_decode($request->getContent())` (see `DocumentController::jsonBody`), not `$request->input()`.
- Rich text is HTML limited to `p, br, strong, em, u, ul, li, a[href]`. The server sanitizes every rich text field on every save.
- Design JSON stores **only overrides**. The effective design is the template defaults merged with them.
- Autosave sends `revision`. A mismatch returns 409, and the editor offers a reload.
- Photos are embedded in content as cropped WebP data URIs (≤ 200 KB) and are checked for real image magic bytes.
- Write new tests in Pest style. The starter kit's class-based tests are left as they are.
