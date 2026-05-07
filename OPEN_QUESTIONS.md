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

## Auth-protected routes aren't reflected in the menu

`src/components/Menu.tsx:35-40` defines a flat `menuItems` array with no `requiresAuth` flag, so the menu shows all four routes regardless of auth state. Protection lives only at the route in `src/App.tsx:36` (`<ProtectedRoute element={<StopPlaceView />} />`), so an unauthenticated user clicking *Data* triggers a mid-navigation redirect instead of seeing a disabled or hidden item. A fork that wants an auth-aware menu needs a `requiresAuth` field per item and a filter driven by `useAuth().isAuthenticated`. Separately, `ProtectedRoute` is the one auth file that lives outside `src/auth/` (it's at `src/components/auth/ProtectedRoute.tsx`); moving it into `src/auth/` would let the feature folder own its full surface.

## Type/impl split is partial

The codebase has five `*Types.ts` files (`viewConfigTypes`, `dataTableTypes`, `searchTypes`, `productTypes`, `stopPlaceTypes`), suggesting an emerging convention to split substantial type blocks into siblings. It's not applied uniformly — several hooks define types inline.

## Edit pipeline is wired but hollow

The read path is complete (`useStopPlaces` → viewConfig → `GenericDataViewPage`), but the write path stops at a stub. `EditingContext`, `EditActionCell`, and `src/components/sidebar/SidebarContent.tsx:7-8` correctly route an "edit this row" click to render an `EditorComponent` in the sidebar — but `src/data/stop-places/StopPlaceEditor.tsx:22` shows only the item ID with a `// A real stop place form would go here` comment. There is no form library in `package.json` (no react-hook-form, formik, RJSF, etc.), no mutation hook anywhere in `src/data/`, and no write API. A fork that needs editing has to pick a form library, a validation source (e.g. the netex-typescript-model JSON Schema vs hand-written), and a `useUpdateX` hook convention to sit next to the read hook.
