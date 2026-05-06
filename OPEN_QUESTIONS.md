# Open questions

These are known design ambiguities in the current code. They're tracked here so forks can decide before they commit. See [issue #5](https://github.com/entur/inanna/issues/5) for context.

## Generic types coupled to the example domain

The `Order` type (`'asc' | 'desc'`) is defined in `src/data/stop-places/useStopPlaces.ts:5` and imported by five unrelated files: `src/components/data/DataTableHeader.tsx`, `src/components/data/DataPageContent.tsx`, `src/hooks/useDataViewTableLogic.ts`, `src/types/viewConfigTypes.ts`, and `src/data/products/useProducts.ts`. The fact that the `products/` example imports it from `stop-places/` proves the type belongs in a generic location.

## `StopPlace`-typed shared hooks

`src/hooks/useDataViewSearch.ts` is typed to `StopPlace[]` and bakes `__typename === 'ParentStopPlace'` filter logic into "shared" code. To reuse the data-view machinery for non-stop-place data, the hook should be generic over `T` with the domain-specific filter living in the example.

## Hard-coded icon resolution

`src/components/search/SearchAutocomplete.tsx:26-30` checks `result.__typename === 'ParentStopPlace'` to pick an icon. A generic search component shouldn't know domain types.

## Stop-place-shaped GeoJSON conversion

`src/utils/geojsonUtils.ts` exports `convertStopPlacesToGeoJSON` which extracts `legacyCoordinates[0]`, `name.value`, and `stopPlaceType` — the shape of one upstream API. Reusable code would take extractor functions.

## `ErrorPage` reaches into the example

`src/components/common/ErrorPage.tsx` calls `useStopPlaces()` directly. A common error page should take `error`/`loading` as props.

## Domain-leaking generic names

Names like `StopPlaceDetailDialog`, `stopPlaceIdFromUrl`, `stopPlaceLayers`, `StopPlaceTypeFilter` live in supposedly-generic infrastructure (`components/map/`, `hooks/`, `map/`, `components/search/`).

## Duplicate `map/` directories

`src/map/` (mapStyle, RegisterIcons) and `src/components/map/` (LayerControl, MapContainer, etc.) coexist. There's no rule for which goes where.

## Orphan `src/types/`

`src/types/` holds one file (`viewConfigTypes.ts`, the data-view contract). The README originally described it as a directory for `.d.ts` module-augmentation files, but those have moved (e.g. `theme-config.d.ts` now lives in `theme/`). The folder's purpose is undefined.

## File-extension hygiene not enforced

The convention "JSX in `.tsx`, otherwise `.ts`" is implicit. Two files violate it today: `src/contexts/ConfigContext.tsx` and `src/data/stop-places/fetchStopPlaces.tsx` (no JSX). No ESLint rule blocks regressions.

## Type/impl split is partial

The codebase has five `*Types.ts` files (`viewConfigTypes`, `dataTableTypes`, `searchTypes`, `productTypes`, `stopPlaceTypes`), suggesting an emerging convention to split substantial type blocks into siblings. It's not applied uniformly — several hooks define types inline.
