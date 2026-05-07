# NeTEx entity-name lookup

When the user describes their domain in plain words, map to the NeTEx entity name(s) that go into `ts-gen.ts`. Names are case-sensitive and must match the schema (`VehicleType`, not `vehicleType`).

## Domain word → NeTEx entity

| Domain word the user says | NeTEx entity | Notes |
|---|---|---|
| stop / station / platform | `StopPlace`, `Quay`, `ParentStopPlace` | Inanna's example domain. Quay is a single boarding point; StopPlace groups Quays; ParentStopPlace is a multi-modal hub. |
| station group / multi-modal hub | `ParentStopPlace` | Composite of StopPlaces. |
| line / route number / "Line 5" | `Line` | The published service identity. Pair with `Route` for path geometry. |
| route shape / path on a map | `Route` | Ordered point sequence the line follows. |
| journey pattern / line variant | `JourneyPattern` | A line's typical ordering of stops; one Line has many Patterns. |
| service / scheduled trip | `ServiceJourney` | A specific run on a recurring date pattern. |
| dated journey / specific trip on a date | `DatedServiceJourney` | Calendar-bound instance of a ServiceJourney. |
| stop visit / scheduled passing time | `StopPointInJourneyPattern`, `TimetabledPassingTime` | The first names a stop within a pattern; the second adds time. |
| operator / company that runs it | `Operator` | The legal entity running the service. |
| authority / PT agency | `Authority` | Owns/regulates the network (e.g. Ruter, Entur). |
| network / set of related lines | `Network` | Grouping construct for a coordinated set of Lines. |
| vehicle | `Vehicle`, `VehicleType` | Vehicle = an instance; VehicleType = a class (capacity, layout). |
| vehicle assignment / "what vehicle runs what trip" | `Block`, `BlockJourney` | |
| deck / seat layout | `DeckPlan` | NeTEx-Deckplan-Editor uses this. |
| fare / ticket type | `FareProduct`, `PreassignedFareProduct` | Part 3 (fares). |
| fare zone / tariff zone | `TariffZone`, `FareZone` | Geographic zones for fare calculation. |
| validity / "when does this apply" | `ValidBetween`, `OperatingPeriod`, `DayType` | Temporal bounds on entities. |
| flexible / on-demand transport | Part 5 entities (`FlexibleService`, `BookingArrangement`) | Use `ASSEMBLY=new-modes`. |

## How to generate (no local clone — install the published tarball)

`entur/netex-typescript-model` publishes one `.tgz` per assembly per release. Each tarball is npm-installable and exposes a `netex-ts-gen` CLI. The fork project depends on a tarball directly; the source repo is never cloned.

### Step 1 — pick the assembly

| Assembly | Covers | Use when |
|---|---|---|
| `base` | Site Frame: `StopPlace`, `Quay`, `ParentStopPlace`, geography | Stop-place registry forks |
| `network+timetable` | `base` + Lines, Routes, JourneyPatterns, ServiceJourneys, schedules | Timetable / routing forks |
| `fares+network+new-modes+timetable` | Everything including Part 3 (fares) and Part 5 (on-demand) | Fare-aware or flexible-transport forks |

Pick the smallest assembly that covers all the user's entities. Multiple assemblies can be installed side-by-side under different package names if the entities cross boundaries.

### Step 2 — find the latest release

```bash
gh release list -R entur/netex-typescript-model | head -1
gh release view <tag> -R entur/netex-typescript-model --json assets --jq '.assets[].name'
```

This gives the version (e.g. `v0.4.1`) and the exact tarball filenames (e.g. `netex-2.0-v2.0-base-v0.4.1.tgz`).

### Step 3 — install into the fork

```bash
cd <fork>
npm install -D https://github.com/entur/netex-typescript-model/releases/download/<tag>/netex-2.0-v2.0-<assembly>-<tag>.tgz
```

This adds `@entur/netex-typescript-model-<assembly-slug>` to `devDependencies`. The bundled JSON Schema lives at `node_modules/@entur/netex-typescript-model-<slug>/<assembly>.schema.json`.

### Step 4 — generate

```bash
cd <fork>
npx netex-ts-gen --dest-dir src/data/<feature> --overwrite \
  --collapse-refs --collapse-collections \
  <EntityName1> <EntityName2>
```

Per target `<Name>` you get:
- `<Name>.ts` — interface + all transitive type deps (self-contained)
- `<Name>-mapping.ts` — XML serialization functions

### CLI flags

| Flag | Effect |
|---|---|
| `--dest-dir <path>` | Where to write the `.ts` files (default `/tmp`) |
| `--overwrite` | Replace existing files |
| `--collapse-refs` | Inline single-target ref types — recommended for ergonomic types |
| `--collapse-collections` | Inline single-child collection wrappers — recommended |
| `--schema <path>` | Use a different `.schema.json` (e.g. another tarball's bundled schema) |
| `--exclude <prop>` | Strip a property from generated types |
| `--suffix <s>` | Tag output filenames |

All output is type-checked with `tsc --strict`; exit code is 1 if any target fails to compile.

## When the user's domain isn't NeTEx

If the user's domain is genuinely not transit-related (e.g. asset registry, customer CRM), don't force NeTEx onto it. Hand-write types following the existing `*Types.ts` convention in the codebase. The netex-typescript-model tooling adds no value outside transit/mobility data.
