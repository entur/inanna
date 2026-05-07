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
| flexible / on-demand transport | `FlexibleService`, `BookingArrangement` | NeTEx Part 5 entities. |

## How to generate (fetch schema + install CLI tarball)

`entur/netex-typescript-model` ships **two artifacts per release**:
- **`netex-jsonschema-full-2.0.json`** — the full NeTEx 2.0 JSON Schema (Draft 07) with `x-netex-*` annotations. One file, covers everything (no per-assembly split).
- **`netex-ts-gen.tgz`** — the codegen CLI, installable as a normal npm dependency.

The fork project depends on the CLI tarball; the source repo is never cloned. The schema file is committed into the fork so builds are reproducible without a network round-trip.

### Step 1 — fetch the schema into the fork

```bash
cd <fork>
curl -L -O https://github.com/entur/netex-typescript-model/releases/latest/download/netex-jsonschema-full-2.0.json
```

Commit the file. For reproducible builds pin a tag instead of `latest`:

```bash
TAG=v0.5.0
curl -L -O https://github.com/entur/netex-typescript-model/releases/download/$TAG/netex-jsonschema-full-2.0-$TAG.json
```

### Step 2 — install the codegen CLI

```bash
npm install -D https://github.com/entur/netex-typescript-model/releases/latest/download/netex-ts-gen.tgz
```

Pinned variant:

```bash
npm install -D https://github.com/entur/netex-typescript-model/releases/download/$TAG/netex-ts-gen-$TAG.tgz
```

### Step 3 — generate

```bash
npx netex-ts-gen --schema ./netex-jsonschema-full-2.0.json \
  --dest-dir src/data/<feature> --overwrite \
  --collapse-refs --collapse-collections \
  <EntityName1> <EntityName2>
```

Per target `<Name>` you get:
- `<Name>.ts` — interface + all transitive type deps (self-contained)
- `<Name>-mapping.ts` — XML serialization functions (pair with `fast-xml-parser`'s XMLBuilder to emit NeTEx XML)

### CLI flags

| Flag | Default | Effect |
|---|---|---|
| `--schema <path>` | (required) | Path to the JSON Schema fetched in Step 1 |
| `--dest-dir <path>` | `/tmp` | Where to write the `.ts` files |
| `--overwrite` | `false` | Replace existing output files (otherwise skipped) |
| `--collapse-refs` | `false` | Replace `VersionOfObjectRefStructure` with target-aware `Ref<'Entity'>` / `SimpleRef` — recommended for ergonomic types |
| `--collapse-collections` | `false` | Replace single-child `_RelStructure` wrappers with the child entity type — recommended |
| `--exclude <a,b,...>` | (none) | Comma-separated property names to strip (e.g. `$changed,$created,$modification,Extensions,alternativeTexts`) |
| `--suffix <s>` | `""` | Append to output filenames (`Vehicle.ts` → `Vehicle-<s>.ts`) |

Each output file is type-checked with `tsc --strict --skipLibCheck`; exit code is 0 if all targets pass, 1 otherwise. Unknown entity names are skipped with a warning.

## When the user's domain isn't NeTEx

If the user's domain is genuinely not transit-related (e.g. asset registry, customer CRM), don't force NeTEx onto it. Hand-write types following the existing `*Types.ts` convention in the codebase. The netex-typescript-model tooling adds no value outside transit/mobility data.
