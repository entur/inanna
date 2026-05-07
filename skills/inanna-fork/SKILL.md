---
name: inanna-fork
description: Bootstrap a clean Inanna fork. Copy the repo to a target path, walk the user through Inanna's OPEN_QUESTIONS.md to capture design decisions, help replace the example domain (stop-places/products) with the user's own, and — if the new domain is NeTEx-shaped (transit data) — generate TypeScript types via the entur/netex-typescript-model ts-gen tool. Trigger this skill whenever a user mentions forking Inanna, scaffolding a new project from Inanna, customizing Inanna for a different domain, replacing the stop-place example, or extending Inanna toward another NeTEx subdomain — even if they don't say "skill" or "fork" explicitly.
---

# Inanna Fork Skill

## Why this skill exists

Inanna (`github.com/entur/inanna`) is a React 19 + Vite + MUI v7 + MapLibre starter. It ships with **NeTEx stop-place + product data as example/demo content** — meant to be ripped out and replaced with the forker's own domain. The repo intends to be a "fork-a-blueprint", not an app.

Two things make a naive fork painful:
1. **Leaky example domain.** Generic infrastructure (search, data-views, error pages, GeoJSON conversion) currently imports stop-place types and hardcodes stop-place strings (`__typename === 'ParentStopPlace'`). A forker who just deletes `data/stop-places/` will hit a broken build. `OPEN_QUESTIONS.md` at the repo root catalogues these leaks.
2. **No domain modelling guidance.** Forkers in the Entur ecosystem usually want a NeTEx-shaped domain (lines, journeys, vehicles, fares). Hand-writing NeTEx TypeScript types is hard and error-prone — `entur/netex-typescript-model` exists to generate them, but a forker may not know that.

This skill walks both problems: it scaffolds a clean copy, captures decisions on each open question, and points at the right type-generation tool when the new domain is NeTEx-shaped.

## When to trigger

- "I want to fork Inanna for X"
- "Help me start a new project from Inanna"
- "I forked Inanna, now what?"
- "How do I add my own data to Inanna?"
- "Replace the stop-place example with Y"
- "Extend Inanna for vehicles/journeys/fares"
- Any combination of `inanna` + `fork` / `customize` / `extend` / `scaffold` / `replace`.

## Workflow (4 phases — do them in order)

### Phase 1: Coarse decisions + bootstrap

Before anything else, ask three coarse yes/no questions. They gate large chunks of the rest of the workflow, so getting them upfront avoids drilling into details that may not apply.

**Ask all three together as a single batch — do not ask the ten OPEN_QUESTIONS at this stage.**

1. **Keep the stop-place demo domain as a reference, or drop it?**
   - *Keep* → leave `src/data/stop-places/` and the example pages; the user can study them while building their own domain alongside, then delete later.
   - *Drop* → Phase 4 deletes `src/data/stop-places/`, `src/data/products/`, and the demo pages/views.

2. **Apply the recommended OPEN_QUESTIONS defaults wholesale, or interview each one?**
   - *Wholesale* (default — recommend this) → Phase 2 writes `FORK_DECISIONS.md` with the issue-#5-aligned defaults already filled in (the table below). Then it lists them and asks "anything you want to change?" — one batched confirmation, not ten.
   - *Interview* → Phase 2 walks each open question one at a time.

3. **Domain shape: NeTEx-modelled, hand-written, or undecided?**
   - *NeTEx* → Phase 3 takes Path A (install `entur/netex-typescript-model` tarball, `npx netex-ts-gen`).
   - *Hand-written* → Phase 3 takes Path B (interview entities, write `*Types.ts`).
   - *Undecided* → defer Phase 3; the bootstrap is still useful and the domain can be modelled later.

Then ask:

4. **Target path** for the new fork (e.g. `~/projects/foo`).
5. **Project name** (kebab-case, becomes the npm `name`).

Run `scripts/scaffold.sh <target> <name>`. It clones from a **pinned upstream URL + branch** rather than a local path, so every fork starts from the same known revision (the docs-cleaned tree with `OPEN_QUESTIONS.md`), independent of whatever's on disk and independent of where `main` is today.

Pinned upstream (see `scripts/scaffold.sh`):
- URL: `https://github.com/entur/inanna.git`
- Branch: `fix/issue5-docs`

When the docs branch merges to `main`, update the constant in `scaffold.sh` and bump this skill's version.

The script does a shallow `--single-branch` clone, deletes the upstream `.git`, runs `git init -b main` + initial commit, rewrites `package.json` `name`, and rewrites the README's first H1 to the new project name. If `git clone` fails (no network, repo gone), tell the user — do not silently fall back to a local copy.

Verify by running `npm install` then `npm run dev` in the new target. Don't proceed to Phase 2 until the dev server boots.

### Phase 2: Capture decisions on the open questions

Read `OPEN_QUESTIONS.md` at the new fork's root. The behaviour here depends on the Phase-1 answer to question 2 (wholesale vs interview).

**Recommended defaults** — aligned with [issue #5](https://github.com/entur/inanna/issues/5):

| # | Topic | Default |
|---|---|---|
| 1 | `Order` type location | Move to `src/types/sorting.ts` |
| 2 | `useDataViewSearch` typing | Generify over `T`; move stop-place filter to example |
| 3 | `SearchAutocomplete` icon resolver | Add `getIconKey?: (result) => string` prop |
| 4 | `convertToGeoJSON` shape | Generify with extractor functions; example wrapper |
| 5 | `ErrorPage` data source | Take `error`/`loading` as props |
| 6 | Domain-leaking generic names | Rename to generic; provide example wrappers in `examples/` |
| 7 | Duplicate `src/map/` and `src/components/map/` | Collapse into `src/components/map/` |
| 8 | Orphan `src/types/` purpose | Shared cross-feature types only (Order, sorting, view-config) |
| 9 | `.ts`/`.tsx` rule | Add ESLint `react/jsx-filename-extension` |
| 10 | Type/impl split | Sibling `*Types.ts` for files where types exceed ~30 lines |

#### Mode A — Wholesale (default)

Write `FORK_DECISIONS.md` at the repo root with all 10 decisions pre-filled from the table above. Each section uses this format:

```markdown
## Q1: Order type location
**Decision:** Move to `src/types/sorting.ts`.
**Why:** Cited by 5 unrelated files (DataTableHeader, DataPageContent, useDataViewTableLogic, viewConfigTypes, products/useProducts); belongs in shared types.
**Action:** Extract type, update 5 imports, delete the original from `src/data/stop-places/useStopPlaces.ts`.
```

Then summarise the 10 decisions as a numbered list and ask the user one batched question: *"These are the defaults. Anything you want to change?"* Only walk individual questions for the items they push back on. Update `FORK_DECISIONS.md` for any overrides; leave the rest as-is.

#### Mode B — Interview

Walk each open question one at a time. For each: present the leak (cite file paths from OPEN_QUESTIONS.md), ask how the user wants to resolve it, write the captured decision to `FORK_DECISIONS.md` using the same format as above. Only suggest the default from the table if the user is genuinely unsure.

In both modes, `FORK_DECISIONS.md` becomes the punch-list for Phase 4 and beyond.

### Phase 3: Model the new domain

Ask: "What's the new domain?" Sort it into one of these:

**Path A — NeTEx-shaped (transit data).** Lines, Routes, JourneyPatterns, ServiceJourneys, Vehicles, Fares, etc.

The fork installs `entur/netex-typescript-model` as a published tarball — no local clone of that repo is needed. Pick the assembly that covers the user's entities, install it, then call the bundled `netex-ts-gen` CLI.

1. **Pick the assembly.** Each assembly bundles its own JSON Schema; pick the smallest one that covers all the entities the user wants. See `references/netex-entities.md` for the entity-to-assembly mapping. As of v0.4.1:
   - `base` — Site Frame (StopPlace, Quay, ParentStopPlace, geography)
   - `network+timetable` — `base` + Lines, Routes, JourneyPatterns, ServiceJourneys, schedules
   - `fares+network+new-modes+timetable` — full set including fares and on-demand
2. **Install the tarball as a devDep:**
   ```bash
   cd <fork>
   npm install -D https://github.com/entur/netex-typescript-model/releases/download/v0.4.1/netex-2.0-v2.0-<assembly>-v0.4.1.tgz
   ```
   Replace `<assembly>` with one of the three names above. The release version (`v0.4.1`) should be the latest at the time of forking — verify with `gh release list -R entur/netex-typescript-model` before running.
3. **Look up entity names.** Map domain words → NeTEx entity names via `references/netex-entities.md` (case-sensitive: `VehicleType`, not `vehicleType`).
4. **Generate types into the fork:**
   ```bash
   npx netex-ts-gen --dest-dir src/data/<feature> --overwrite \
     --collapse-refs --collapse-collections \
     <Entity1> <Entity2>
   ```
   This produces `<Entity>.ts` (interface + transitive deps, self-contained) and `<Entity>-mapping.ts` (XML serialization). `--collapse-refs --collapse-collections` is recommended for ergonomic types — drop those flags if the fork needs verbatim NeTEx structure.
5. If the user's entities span more than one assembly's coverage, install both tarballs side-by-side (different package names) and use `npx netex-ts-gen --schema ./node_modules/@entur/netex-typescript-model-<other>/<other>.schema.json ...` to point at a specific bundled schema.

**Path B — Non-NeTEx domain.** Anything else (custom data, not modelled by NeTEx).
- Interview the user on entities, cardinalities, primary-key shape, optionality.
- Produce hand-written `<Feature>Types.ts` files that follow the existing convention (`viewConfigTypes`, `productTypes`, `stopPlaceTypes`).

For both paths, every domain feature needs:
1. A type file (`<Feature>Types.ts` or generated `<Entity>.ts`)
2. A data hook returning that type — model on `src/data/stop-places/useStopPlaces.ts` or `src/data/products/useProducts.ts`
3. A view config (`<feature>ViewConfig.ts`) that drives `GenericDataViewPage`
4. A route entry in `App.tsx`

### Phase 4: Apply decisions, wire the new domain

Behaviour depends on the Phase-1 answer to question 1 (keep stop-place demo or drop):

- **Drop:** delete `src/data/stop-places/`, `src/data/products/`, `src/pages/StopPlaceView.tsx`, `src/pages/ProductView.tsx`, and any imports that referenced them. The fork will fail typecheck until Phase 3 has produced replacements — that's intentional.
- **Keep:** leave the example dirs; just add the new domain alongside. The user can delete the demos later when their own domain is fleshed out.

Then, in order:
1. Apply each `FORK_DECISIONS.md` action one at a time, committing after each. The decisions from Phase 2 are the punch-list.
2. Wire the new domain types/hooks/views from Phase 3 into `App.tsx` routes.
3. Update `EXAMPLE_ICONS` and `EXAMPLE_MAP_FILTERS` (per Q3/Q6 decisions) to be props/overrides — keep stop-place defaults if the new domain is also map-displayable, or strip them if not.

After Phase 4, `npm run dev` should still boot, and the new domain's data view should load (with stub data if the backend isn't ready).

## What this skill does NOT do
- Doesn't push to a remote — the user creates their own GitHub repo.
- Doesn't choose a license (Inanna ships EUPL-1.2; the fork can change).
- Doesn't auto-execute the issue #5 refactor; it only captures the decisions and produces the punch-list.
- Doesn't write the backend — frontend types may need a matching GraphQL/REST API; out of scope here. See `entur/sobek` for a reference backend.

## Output checklist

When the skill finishes, the user has:
- [ ] A new project directory at the chosen path with a working `npm run dev`
- [ ] `FORK_DECISIONS.md` at the new project's root, one section per open question, all answered
- [ ] Type files (generated or hand-written) for the new domain under `src/data/<feature>/`
- [ ] Updated `App.tsx` routes
- [ ] First commit on the new repo's `main`

## References (kept short on purpose)

- **`references/netex-entities.md`** — domain word → NeTEx entity name lookup. Read this when invoking Path A in Phase 3.
- **`entur/netex-typescript-model` releases** — the generator, published as installable `.tgz` tarballs (no local clone needed). Latest tag: check `gh release list -R entur/netex-typescript-model`. Each tarball bundles a `bin: netex-ts-gen` CLI plus an assembly's JSON Schema.
- **`entur/sobek`** — Spring Boot backend producing NeTEx GraphQL. Reference for backend/frontend type alignment.
- **`OPEN_QUESTIONS.md`** in the forked repo itself — read fresh from the new fork in Phase 2.
