---
name: inanna-fork
description: Bootstrap a clean Inanna fork OR extend an already-forked Inanna with new entities/features. Bootstrap mode copies the repo to a target path, walks the user through OPEN_QUESTIONS.md to capture design decisions, and helps replace the example domain (stop-places/products) with the user's own. Extend mode skips the scaffold and jumps straight to entity modelling against an existing fork. In both modes — if the domain is NeTEx-shaped (transit data) — TypeScript types are generated via the entur/netex-typescript-model ts-gen tool. Trigger whenever a user mentions forking Inanna, scaffolding a new project from Inanna, customizing Inanna for a different domain, replacing the stop-place example, adding entities/features to an existing fork, or extending Inanna toward another NeTEx subdomain — even if they don't say "skill" or "fork" explicitly.
---

# Inanna Fork Skill

## Why this skill exists

Inanna (`github.com/entur/inanna`) is a React 19 + Vite + MUI v7 + MapLibre starter. It ships with **NeTEx stop-place + product data as example/demo content** — meant to be ripped out and replaced with the forker's own domain. The repo intends to be a "fork-a-blueprint", not an app.

Two things make a naive fork painful:
1. **Leaky example domain.** Generic infrastructure (search, data-views, error pages, GeoJSON conversion) currently imports stop-place types and hardcodes stop-place strings (`__typename === 'ParentStopPlace'`). A forker who just deletes `data/stop-places/` will hit a broken build. `OPEN_QUESTIONS.md` at the repo root catalogues these leaks.
2. **No domain modelling guidance.** Forkers in the Entur ecosystem usually want a NeTEx-shaped domain (lines, journeys, vehicles, fares). Hand-writing NeTEx TypeScript types is hard and error-prone — `entur/netex-typescript-model` exists to generate them, but a forker may not know that.

This skill walks both problems: it scaffolds a clean copy, captures decisions on each open question, and points at the right type-generation tool when the new domain is NeTEx-shaped.

## When to trigger

Bootstrap-flavoured:
- "I want to fork Inanna for X"
- "Help me start a new project from Inanna"
- "I forked Inanna, now what?"
- "How do I add my own data to Inanna?"
- "Replace the stop-place example with Y"

Extend-flavoured (an already-forked Inanna):
- "I forked Inanna and want to add `<Entity>`"
- "Add a new feature to my Inanna fork"
- "Extend my fork's entity graph with X"
- "Extend Inanna for vehicles/journeys/fares"

Any combination of `inanna` + `fork` / `customize` / `extend` / `scaffold` / `replace` / `add entity` / `extend entity graph`.

## Workflow

The skill has two modes selected in Phase 0: **bootstrap** (fresh fork) and **extend** (already-forked tree). Phases are gated by mode; Phase 3 is shared.

```
Phase 0    Mode selection: bootstrap | extend
Phase 1    Coarse decisions + scaffold.sh                    [bootstrap]
Phase 1-ext Coarse decisions for extending an existing fork  [extend]
Phase 2    OPEN_QUESTIONS capture → FORK_DECISIONS.md        [bootstrap]
Phase 3    Model the new domain                              [shared]
Phase 4    Apply decisions, wire the new domain              [bootstrap]
Phase 4-ext Wire new domain into existing fork               [extend]
```

### Phase 0: Mode selection

Before anything else, ask one root question. **Do not auto-detect** — a heuristic peeking at cwd (e.g. `package.json` name, presence of `OPEN_QUESTIONS.md`) is brittle and a wrong default is more annoying than one extra sentence per session.

> Are you (a) **bootstrapping** a new fork from upstream, or (b) **extending** an already-forked Inanna?

- **Bootstrap** → continue to Phase 1.
- **Extend** → ask for the absolute path of the existing fork (no default — the user types it). `cd` there for the rest of the session, then jump to Phase 1-ext. Phases 1 and 2 do not run.

### Phase 1 (bootstrap mode): Coarse decisions + scaffold

After Phase 0 has selected bootstrap mode, ask three coarse yes/no questions. They gate large chunks of the rest of the workflow, so getting them upfront avoids drilling into details that may not apply.

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

### Phase 1-ext (extend mode): Coarse decisions

Skipped in bootstrap mode. The user already has a fork (path captured in Phase 0); the goal here is to figure out what they're adding and where it slots. Ask all four questions together as one batch:

1. **Domain shape?**
   - *NeTEx* (Path A in Phase 3) — entities defined by the NeTEx schema (Lines, Routes, Vehicles, etc.).
   - *Hand-written* (Path B) — custom domain not modelled by NeTEx.
   - *Augment existing* (Path C, Phase 3) — adding entities to a feature dir that's already been generated (e.g. add `JourneyPattern` to a folder that already contains generated `Line` and `Route`).

2. **Slot it where?**
   - New feature dir `src/data/<name>/` (default).
   - Inside an existing feature dir (Path C territory).
   - Types/hook only, no new dir (when a sibling feature consumes it).

3. **View integration?**
   - New `*ViewConfig.ts` + new page under `src/pages/` + new route in `App.tsx` (default).
   - Reuse an existing view (data flows into a view that already exists).
   - Non-UI — types/hook only, no view.

4. **Path A only — `netex-ts-gen` already installed?** Check `package.json` devDeps. If yes, Phase 3 skips the install + schema fetch; if no, Phase 3 runs them. Same goes for `netex-jsonschema-full-2.0.json` at the repo root.

These supersede bootstrap's "keep/drop demo" and "wholesale/interview" coarse questions.

### Phase 2 (bootstrap mode): Capture decisions on the open questions

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

### Phase 3: Model the new domain (shared by both modes)

Ask: "What's the new domain?" In **bootstrap** mode this is wide open. In **extend** mode the answer was already captured in Phase 1-ext (Path A / B / C). Sort into one of these:

**Path A — NeTEx-shaped (transit data).** Lines, Routes, JourneyPatterns, ServiceJourneys, Vehicles, Fares, etc.

`entur/netex-typescript-model` ships **two artifacts per release**: the full JSON Schema as a standalone file, and the codegen CLI as an npm-installable tarball. There's no local clone of that repo, and the per-assembly choice from earlier versions is gone — the full schema is a single file that covers everything.

1. **Fetch the schema** into the fork and commit it (so builds are reproducible without a network):
   ```bash
   cd <fork>
   curl -L -O https://github.com/entur/netex-typescript-model/releases/latest/download/netex-jsonschema-full-2.0.json
   ```
2. **Install the codegen CLI as a devDep:**
   ```bash
   npm install -D https://github.com/entur/netex-typescript-model/releases/latest/download/netex-ts-gen.tgz
   ```
3. **Look up entity names.** Map domain words → NeTEx entity names via `references/netex-entities.md` (case-sensitive: `VehicleType`, not `vehicleType`).
4. **Generate types into the fork:**
   ```bash
   npx netex-ts-gen --schema ./netex-jsonschema-full-2.0.json \
     --dest-dir src/data/<feature> --overwrite \
     --collapse-refs --collapse-collections \
     <Entity1> <Entity2>
   ```
   This produces `<Entity>.ts` (interface + transitive deps, self-contained) and `<Entity>-mapping.ts` (XML serialization). `--collapse-refs --collapse-collections` produces ergonomic, target-aware types (`Ref<'DeckPlan'>` instead of `VersionOfObjectRefStructure`) — drop those flags only if the fork needs verbatim NeTEx structure.

For reproducibility, pin to a specific release tag instead of `latest`:
   ```bash
   TAG=v0.5.0
   curl -L -O https://github.com/entur/netex-typescript-model/releases/download/$TAG/netex-jsonschema-full-2.0-$TAG.json
   npm install -D https://github.com/entur/netex-typescript-model/releases/download/$TAG/netex-ts-gen-$TAG.tgz
   ```

**In extend mode**, skip steps the fork already has done:
- `grep '"netex-ts-gen"' package.json` — if present, skip the `npm install -D` step.
- If `netex-jsonschema-full-2.0.json` is already at the repo root, skip the `curl`. Tell the user to bump it manually if they want a newer schema version (re-run the curl, commit the change).
- Generate into the dir chosen by the Phase 1-ext slotting answer (`--dest-dir src/data/<feature>`).

**Path B — Non-NeTEx domain.** Anything else (custom data, not modelled by NeTEx).
- Interview the user on entities, cardinalities, primary-key shape, optionality.
- Produce hand-written `<Feature>Types.ts` files that follow the existing convention (`viewConfigTypes`, `productTypes`, `stopPlaceTypes`).

**Path C — Augmenting an existing typed feature (extend mode only).** The fork already generated some entities into `src/data/<feature>/` and the user now wants to add another entity to the same feature (e.g. `Line` and `Route` are already there, now add `JourneyPattern`). Two sub-paths — show **both** to the user and let them pick:

- **C1 — Incremental add (no regen):**
  ```bash
  npx netex-ts-gen --schema ./netex-jsonschema-full-2.0.json \
    --dest-dir src/data/<feature> \
    --collapse-refs --collapse-collections \
    JourneyPattern   # <-- only the new entity
  ```
  Existing files are preserved. The generator may emit transitive-dep files that overlap with files already in the dir — reconcile any duplicates by hand. Use this when the previously-generated files have hand-edits worth keeping (project-specific JSDoc, helpers, etc.).

- **C2 — Full regen (recommended default):**
  ```bash
  npx netex-ts-gen --schema ./netex-jsonschema-full-2.0.json \
    --dest-dir src/data/<feature> --overwrite \
    --collapse-refs --collapse-collections \
    Line Route JourneyPattern   # <-- old + new in one command
  ```
  Generator owns the directory; any hand-edits to `<Entity>.ts` / `<Entity>-mapping.ts` are lost. Cleanest output, deterministic, refs resolve consistently. Recommend this unless the user confirms they have hand-edits to preserve.

Across all three paths, a domain feature needs:
1. A type file (`<Feature>Types.ts` or generated `<Entity>.ts`)
2. A data hook returning that type — model on `src/data/stop-places/useStopPlaces.ts` or `src/data/products/useProducts.ts`
3. A view config (`<feature>ViewConfig.ts`) that drives `GenericDataViewPage`
4. A route entry in `App.tsx`

In **extend** mode, items 2–4 only apply when the Phase-1-ext "view integration" answer was *new view*. For *reuse existing* or *non-UI* the relevant pieces are skipped.

### Phase 4 (bootstrap mode): Apply decisions, wire the new domain

Behaviour depends on the Phase-1 answer to question 1 (keep stop-place demo or drop):

- **Drop:** delete `src/data/stop-places/`, `src/data/products/`, `src/pages/StopPlaceView.tsx`, `src/pages/ProductView.tsx`, and any imports that referenced them. The fork will fail typecheck until Phase 3 has produced replacements — that's intentional.
- **Keep:** leave the example dirs; just add the new domain alongside. The user can delete the demos later when their own domain is fleshed out.

Then, in order:
1. Apply each `FORK_DECISIONS.md` action one at a time, committing after each. The decisions from Phase 2 are the punch-list.
2. Wire the new domain types/hooks/views from Phase 3 into `App.tsx` routes.
3. Update `EXAMPLE_ICONS` and `EXAMPLE_MAP_FILTERS` (per Q3/Q6 decisions) to be props/overrides — keep stop-place defaults if the new domain is also map-displayable, or strip them if not.

After Phase 4, `npm run dev` should still boot, and the new domain's data view should load (with stub data if the backend isn't ready).

### Phase 4-ext (extend mode): Wire new domain into existing fork

Bootstrap's Phase 4 doesn't run in extend mode — the fork is already wired and most of bootstrap's punch-list is irrelevant. Replace it with this shorter sequence:

1. **Typecheck the generated/new types.** `npx tsc --noEmit`. Fix any unresolved refs before proceeding (most often: a missing entity in the Path A/C invocation).
2. **Add the data hook** `use<Feature>.ts` modelled on `src/data/stop-places/useStopPlaces.ts` or `src/data/products/useProducts.ts`. Use stub data if no backend is wired up yet.
3. **If new view** (per Phase 1-ext): create `<feature>ViewConfig.ts`, add a page component under `src/pages/`, register the route in `App.tsx`. Skip when reusing an existing view or going non-UI.
4. **If map-displayable**: extend `EXAMPLE_MAP_FILTERS` / `EXAMPLE_ICONS`, or — if the fork has applied the issue-#5 prop refactor — pass the per-feature equivalents as props.
5. **Smoke-test.** `npm run dev`, navigate to the new route, confirm the view renders.
6. **Commit.** One commit per logical step (types, hook, view, route) keeps the diff readable.

**Issue-#5 caveat.** If the fork hasn't applied the `FORK_DECISIONS.md` punch-list (i.e. generic infra still hardcodes `'ParentStopPlace'` and imports stop-place types), the new feature can still ship — it just has to piggyback on the same wrappers stop-places uses, perpetuating the leak. If the user wants to clean it up, run bootstrap-mode Phase 2 + Phase 4 against the existing fork as a separate task; the skill flow doesn't try to detect or auto-apply this.

## What this skill does NOT do
- Doesn't push to a remote — the user creates their own GitHub repo.
- Doesn't choose a license (Inanna ships EUPL-1.2; the fork can change).
- Doesn't auto-execute the issue #5 refactor; it only captures the decisions and produces the punch-list.
- Doesn't write the backend — frontend types may need a matching GraphQL/REST API; out of scope here. See `entur/sobek` for a reference backend.

## Output checklist

### Bootstrap mode

- [ ] A new project directory at the chosen path with a working `npm run dev`
- [ ] `FORK_DECISIONS.md` at the new project's root, one section per open question, all answered
- [ ] Type files (generated or hand-written) for the new domain under `src/data/<feature>/`
- [ ] Updated `App.tsx` routes
- [ ] First commit on the new repo's `main`

### Extend mode

- [ ] `npx tsc --noEmit` passes against the new types
- [ ] New / augmented type files under `src/data/<feature>/`
- [ ] Data hook returning the new types (real or stubbed)
- [ ] New route reachable from the dev server (when "view integration" was *new view*)
- [ ] `npm run dev` boots without regressions
- [ ] Issue-#5 caveat acknowledged — either the fork was already cleaned up, or the new feature piggybacks on existing wrappers and the user knows it
- [ ] One or more commits on the user's working branch

## References (kept short on purpose)

- **`references/netex-entities.md`** — domain word → NeTEx entity name lookup. Read this when invoking Path A in Phase 3.
- **`entur/netex-typescript-model` releases** — two artifacts per release: `netex-jsonschema-full-2.0.json` (the full NeTEx 2.0 JSON Schema, fetched with `curl`) and `netex-ts-gen.tgz` (the codegen CLI, installed via `npm`). Use the `latest` redirect to track HEAD, or pin a tag for reproducible builds. There is no local clone of that repo, and no per-assembly choice — the full schema covers everything.
- **`entur/sobek`** — Spring Boot backend producing NeTEx GraphQL. Reference for backend/frontend type alignment.
- **`OPEN_QUESTIONS.md`** in the forked repo itself — read fresh from the new fork in Phase 2.
