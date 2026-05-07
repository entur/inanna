# Inanna

A Structured Starting Point for Open-Source Frontend Applications.

---

## What is Inanna?

**Inanna** is an open-source starter template designed to streamline the creation of structured, maintainable, themeable and scalable frontend applications. Leveraging modern best practices, Inanna provides a robust foundational framework that developers can easily customize to kickstart their projects.

## Core Technologies

* **React** with **TypeScript**
* **Vite** for fast and efficient builds
* **Material UI (MUI)** for consistent and configurable UI components
* **MapLibre** for interactive map functionalities

---

## Forking Inanna with the `inanna-fork` skill

This branch ships a Claude skill that scaffolds a clean Inanna fork, walks you through the [open questions](OPEN_QUESTIONS.md), and — for transit/NeTEx domains — generates TypeScript types via the [`netex-typescript-model`](https://github.com/entur/netex-typescript-model) tooling.

Install it globally:

```bash
npx skills add https://github.com/entur/inanna#fix/issue5-docs -g -y
```

Then in Claude Code, ask something like *"fork inanna into ~/projects/my-app called my-app"* and the skill takes over. The skill source lives in [`skills/inanna-fork/`](skills/inanna-fork/).

---

## Features

* **Configurable Theming:**

  Customize your application's look and feel dynamically via a simple configuration file—perfect for branding, logos, and color schemes.

* **Responsive Layout:**

  Ensures your application maintains aesthetic appeal across desktop and mobile devices.

* **State Management:**

  Integrates modern state management techniques (React Context, optional Redux) for efficient application state handling.

* **Interactive Maps:**

  Pre-configured interactive mapping components powered by MapLibre, excellent for building location-based applications.

---

## How to Use Inanna in Your Project

## Getting Started

* **Clone the repository:**

  ```bash
  git clone https://github.com/entur/inanna.git
  ```

* **Install dependencies:**

  ```bash
  npm install
  ```

* **Run the development server:**

  ```bash
  npm run dev
  ```

## Customizing the Project

* **Update Theme Configuration:**

  Modify `public/custom-theme-config.json` or `public/default-theme-config.json` to adjust colors, logos, typography, and other MUI theme options.

* **Add New Pages and Components:**

  Follow provided examples (e.g., `Home.tsx`, `MapView.tsx`) to create pages. Components are organized in the `src/components/` directory.

* **Customize the Map:**

  Adjust the map style via `src/map/mapStyle.ts`, or add layers and interactivity directly.

* **Bring Your Own Icons:**

  Add custom icons to `public/static/customIcons/` (SVG or PNG). Override default icons by matching filenames.

---

## Folder semantics (today)

Inanna's `src/` mixes two organizational styles. Before adding files, know which one you're touching.

**Vertical (feature) folders — peeled off cleanly:**

- `auth/` — OIDC bootstrap, ProtectedRoute, session context.
- `config/` — runtime config fetch + context.
- `theme/` — `createThemeFromConfig`, MUI augmentation, `CustomizationContext`, `useAppTheme`.
- `map/` — `mapStyle.ts`, `RegisterIcons.tsx` (overlaps with `components/map/`, see Open Questions).

**Horizontal (file-kind) folders — pre-feature-folder layout:**

- `components/` — UI components grouped by sub-area (`data/`, `search/`, `map/`, `header/`, `sidebar/`, `dialogs/`, `common/`, `auth/`).
- `hooks/` — every hook in the app, owned by ~5 different features.
- `pages/` — mixes infrastructure (`GenericDataViewPage.tsx`), demo views (`StopPlaceView.tsx`, `ProductView.tsx`), and real pages (`Home.tsx`, `MapView.tsx`).
- `data/` — example data only (`stop-places/`, `products/`); not a generic data-access layer.
- `utils/` — domain-neutral helpers (`geojsonUtils.ts`, `iconLoaderUtils.ts`).
- `types/` — currently holds one file (`viewConfigTypes.ts`); see Open Questions.
- `contexts/` — top-level React contexts not tied to a single feature folder.

**Where new files go (current convention):**

- New page → `pages/`. New route in `App.tsx`.
- New table-backed feature → `data/<feature>/` for the data hook + view config; reuse `pages/GenericDataViewPage.tsx`.
- New hook used by ≥2 features → `hooks/`. Single-feature hook → leave it next to its caller.
- New `.types.ts` file → next to its implementation (existing pattern: `viewConfigTypes.ts`, `dataTableTypes.ts`, `searchTypes.ts`, `productTypes.ts`, `stopPlaceTypes.ts`).
- JSX → `.tsx`. No JSX → `.ts`.

---

## 1. Setting Up a Custom Theme

Your application can switch between a default theme and a custom theme. This behavior is controlled by the **Enable Custom Theme & Icons** switch in the settings dialog, which toggles a value in `localStorage`.

## How it works

* **`CustomizationContext.tsx`:** Manages the `useCustomFeatures` state. When `true`, the app attempts to load the custom theme.

* **`App.tsx`:**

    * Uses the `useCustomFeatures` hook.
    * If enabled, fetches `/custom-theme-config.json`.
    * Otherwise or on failure, fetches `/default-theme-config.json`.

* **`public/default-theme-config.json`:** Default Inanna theme settings.

* **`public/custom-theme-config.json`:** Define or override any MUI theme options here.

* **`src/theme/createThemeFromConfig.ts`:** Converts the JSON configuration into an MUI theme object.

## Steps to customize your theme

* **Edit `public/custom-theme-config.json`:**

  ```json
  {
    "applicationName": "My Custom App",
    "companyName": "My Company",
    "palette": {
      "primary": { "main": "#A020F0" },
      "secondary": { "main": "#00BFFF" },
      "background": { "default": "#F5F5F5" }
    },
    "typography": {
      "fontFamily": "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
      "h1": { "fontSize": "2.8rem" }
    },
    "shape": { "borderRadius": 8 },
    "components": {
      "MuiButton": {
        "styleOverrides": {
          "root": { "textTransform": "capitalize" }
        }
      }
    },
    "logoUrl": "/assets/my-custom-logo.png",
    "logoHeight": 32
  }
  ```

* **Enable Custom Features:**

    * Start the app.
    * Open settings (gear icon).
    * Toggle **Enable Custom Theme & Icons**.
    * The app will apply `custom-theme-config.json` on reload.

---

## 2. Adding Custom Icons

The application’s icon loader resolves custom and default icons based on the **Enable Custom Theme & Icons** setting.

## How it works

* **`src/utils/iconLoaderUtils.ts`** – `getIconUrl(name: string)` checks:

    1. If custom features enabled:

        * `public/static/customIcons/[name].svg` or `.png`
    2. Otherwise or not found:

        * `public/static/defaultIcons/[name].svg` or `.png`
    3. Fallback to `default.svg` / `default.png` in `defaultIcons`.

## Steps to add/override icons

* **Prepare icons** in SVG or PNG.

* **Place in `public/static/customIcons/`:**

    * Override: same filename as default.
    * Add new: unique filename (e.g., `analytics.svg`).

* **Use in components:**

  ```tsx
  import { getIconUrl } from '../utils/iconLoaderUtils';
  import { Box } from '@mui/material';

  const analyticsIconUrl = getIconUrl('analytics');

  return (
    <Box
      component="img"
      src={analyticsIconUrl}
      alt="Analytics"
      sx={{ width: 24, height: 24 }}
    />
  );
  ```

* **Enable Custom Features** in settings to view your icons.

---

## 3. Expanding Theming with TypeScript Definitions

Extend MUI’s theme object in `src/theme/theme-config.d.ts` for additional custom properties.

## How it works

* **`ThemeConfig` Interface:** Extends MUI’s `ThemeOptions` with custom fields.

* **Module Augmentation:** Adds these fields to `Theme` and `ThemeOptions` via `declare module '@mui/material/styles'`.

## Steps to extend the theme

* **Define new properties** in `src/theme/theme-config.d.ts`:

  ```ts
  import type { ThemeOptions } from '@mui/material/styles';

  export interface ThemeConfig extends ThemeOptions {
    applicationName: string;
    companyName: string;
    logoUrl: string;
    logoHeight: number;
    customSpacing: { small: number; medium: number; large: string };
    brandColors: { accentFocus: string };
  }

  declare module '@mui/material/styles' {
    interface Theme {
      applicationName: string;
      companyName: string;
      logoUrl: string;
      logoHeight: number;
      customSpacing: { small: number; medium: number; large: string };
      brandColors: { accentFocus: string };
    }
    interface ThemeOptions {
      applicationName?: string;
      companyName?: string;
      logoUrl?: string;
      logoHeight?: number;
      customSpacing?: { small?: number; medium?: number; large?: string };
      brandColors?: { accentFocus?: string };
    }
  }
  ```

* **Add to JSON configs:**

    * In **`public/default-theme-config.json`**:

      ```json
      {
        "applicationName": "INANNA",
        "companyName": "ROR",
        "logoUrl": "/assets/inanna-logo.png",
        "logoHeight": 48,
        "customSpacing": { "small": 8, "medium": 16, "large": "32px" },
        "brandColors": { "accentFocus": "#FFD700" }
      }
      ```

    * In **`public/custom-theme-config.json`**:

      ```json
      {
        "applicationName": "My Custom App",
        "companyName": "My Company",
        "logoUrl": "/assets/my-custom-logo.png",
        "logoHeight": 32,
        "customSpacing": { "small": 4, "medium": 12, "large": "24px" },
        "brandColors": { "accentFocus": "#10A37F" }
      }
      ```

* **Use custom properties** in components:

  ```tsx
  import { Box, Typography, useTheme } from '@mui/material';

  function MyCustomComponent() {
    const theme = useTheme();
    return (
      <Box sx={{
        padding: theme.customSpacing.medium,
        border: `2px solid ${theme.brandColors.accentFocus}`,
      }}>
        <Typography sx={{ marginBottom: theme.customSpacing.small }}>
          This component uses custom theme properties!
        </Typography>
        <Typography sx={{ fontSize: theme.customSpacing.large }}>
          Large Text!
        </Typography>
      </Box>
    );
  }

  export default MyCustomComponent;
  ```

The `createThemeFromConfig` utility in `src/theme/createThemeFromConfig.ts` will automatically include all custom properties defined in your theme configs.

---

By following these instructions, you can fully customize the Inanna application’s theme, icons, and extend its theming system in a type-safe manner.


# User Guide: Adding a New Data Table Page

This guide will walk you through the steps to create a new, fully-featured data table page, complete with sorting, filtering, searching, and editing capabilities.

## Step 1: Define Your Data Types

First, you need to define the shape of your data. Create a new file in your feature's folder (e.g., `/src/data/your-feature/yourFeatureTypes.ts`).

You will need two types:

1.  An interface for your main data object.
2.  A type for the keys of the properties you want to be sortable.

### Example: `productTypes.ts`

```typescript
// The main data structure
export interface Product {
  id: string;
  version: number;
  name: string;
  price: number;
  stock: number;
  category: 'Electronics' | 'Books' | 'Clothing';
}

// The keys that the user can sort the table by
export type ProductSortKey = 'name' | 'price' | 'stock';
```
## Step 2: Create a Data Fetching Hook
This hook is responsible for fetching, sorting, and paginating your data. It can get data from a live API or, for this example, from a mock data file.
Create a file like /src/data/your-feature/useYourFeature.ts. This hook must return an object with a specific shape that the generic page understands.
### Example: `useProducts.ts`
```typescript jsx
import { useState, useMemo } from 'react';
import type { ProductSortKey } from './productTypes.ts';
import type { Order } from '../stop-places/useStopPlaces.ts';
import { MOCK_PRODUCTS } from './data/mockProducts.ts';
// ... (helper functions for sorting)

export function useProducts() {
  // State for sorting and pagination
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<ProductSortKey>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Logic to handle sort requests
  const handleRequestSort = (property: ProductSortKey) => {
    // ...
  };

  // Memoized sorting logic
  const sortedData = useMemo(() => {
    // ...
  }, [order, orderBy]);

  // Return the data and state handlers
  return {
    allData: sortedData,
    totalCount: MOCK_PRODUCTS.length,
    loading: false, // Set to true while fetching from an API
    error: null,    // Set to an error message on failure
    order,
    orderBy,
    handleRequestSort,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
  };
}
```
## Step 3: Create an Editor Component
This is the component that will appear in the sidebar when a user clicks the "Edit" button on a table row. It must accept a prop named itemId.
Create a file like /src/data/your-feature/YourFeatureEditor.tsx.
### Example: `ProductEditor.tsx`
```typescript jsx
import { Box, Typography, Button } from '@mui/material';
import { useEditing } from '../../contexts/EditingContext.tsx';

interface ProductEditorProps {
  itemId: string; // This prop is required
}

export default function ProductEditor({ itemId }: ProductEditorProps) {
  const { setEditingItem } = useEditing();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Edit Product</Typography>
      <Typography>ID: {itemId}</Typography>
      {/* Your form fields would go here */}
      <Button onClick={() => setEditingItem(null)}>Close</Button>
    </Box>
  );
}
```
## Step 4: Create Custom Cell Components
For each column in your table, you need to define how it renders.
* For simple text, you can do this inline in the main config file.
* For complex rendering (like a formatted price or an "Edit" button), create a dedicated component.
### Example 1: `PriceCell.tsx` (for formatting)
```typescript jsx
interface PriceCellProps {
  price: number;
}

export default function PriceCell({ price }: PriceCellProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return <span>{formattedPrice}</span>;
}
```
### Example 2: `EditActionCell.tsx` (for actions)
This cell is crucial. It links the table row to the EditingContext and tells the sidebar which editor to open.
```typescript jsx
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useEditing } from '../../../contexts/EditingContext.tsx';
import type { Product } from '../productTypes.ts';
import ProductEditor from '../ProductEditor.tsx'; // Import your editor

interface EditActionCellProps {
  item: Product;
}

export default function EditActionCell({ item }: EditActionCellProps) {
  const { setEditingItem } = useEditing();

  return (
    <Tooltip title="Edit Product">
      <IconButton
        onClick={() =>
          // Provide the item's ID and the Editor Component
          setEditingItem({ id: item.id, EditorComponent: ProductEditor })
        }
        color="primary"
      >
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
}
```
## Step 5: Create a Search Integration Hook
This hook connects your data to the application's global search bar. It registers a function that knows how to filter your specific data.
Create a file like /src/data/your-feature/useYourFeatureSearch.ts.
### Example: `useProductSearch.ts`
```typescript
import { useCallback, useEffect } from 'react';
import { useSearch } from '../../components/search';
import type { SearchResultItem } from '../../components/search/searchTypes';
import type { Product } from './productTypes.ts';

export function useProductSearch(allProducts: Product[] | null, productsLoading: boolean) {
  const { setActiveSearchContext, registerSearchFunction } = useSearch();

  // This function contains the logic to filter your data
  const searchProductData = useCallback(
    async (query: string, filters: string[]): Promise<SearchResultItem[]> => {
      if (productsLoading || !allProducts) return [];
      // ... your filtering logic here
      return allProducts
        .filter(p => {
          // ...
        })
        .map(p => ({
          id: p.id,
          name: p.name,
          type: 'data' as const,
          originalData: p,
        }));
    },
    [productsLoading, allProducts]
  );

  // This effect registers the search function with the context
  useEffect(() => {
    setActiveSearchContext('data');
    registerSearchFunction('data', searchProductData);
    return () => {
      registerSearchFunction('data', null); // Cleanup
    };
  }, [setActiveSearchContext, registerSearchFunction, searchProductData]);
}
```
## Step 6: Assemble the View Configuration File
This is the central file that brings everything together. It exports a single configuration object that the generic page component will use.
Create a file like /src/data/your-feature/yourFeatureViewConfig.tsx.
### Example: `productViewConfig.tsx`
```typescript jsx
// Generic Imports
import { useDataViewTableLogic } from '../../hooks/useDataViewTableLogic';
import DataPageContent from '../../components/data/DataPageContent';
import type { ColumnDefinition } from '../../components/data/dataTableTypes.ts';
import type { FilterDefinition } from '../../components/search/searchTypes.ts';

// Your Feature-Specific Imports
import { useProducts } from './useProducts.ts';
import { useProductSearch } from './useProductSearch.ts';
import type { Product, ProductSortKey } from './productTypes.ts';
import PriceCell from './cells/PriceCell.tsx';
import EditActionCell from './cells/EditActionCell.tsx';

// 1. Define your table columns
const productColumns: ColumnDefinition<Product, ProductSortKey>[] = [
  { id: 'name', headerLabel: 'Product Name', isSortable: true, renderCell: item => item.name, display: 'always' },
  { id: 'price', headerLabel: 'Price', isSortable: true, renderCell: item => <PriceCell price={item.price} />, display: 'desktop-only' },
  // ... more columns
  { id: 'actions', headerLabel: 'Actions', align: 'center', renderCell: item => <EditActionCell item={item} />, display: 'always' },
];

// 2. Define your filter and sort helper functions
const getProductFilterKey = (item: Product): string => item.category;
const getProductSortValue = (item: Product, key: ProductSortKey): string | number => item[key];

// 3. Define your filter UI options
const productFilters: FilterDefinition[] = [
  { id: 'Electronics', labelKey: 'product.electronics', defaultLabel: 'Electronics' },
  // ... more filters
];

// 4. Export the final configuration object
export const productViewConfig = {
  useData: useProducts,
  useSearchRegistration: useProductSearch,
  useTableLogic: useDataViewTableLogic,
  PageContentComponent: DataPageContent,
  columns: productColumns,
  getFilterKey: getProductFilterKey,
  getSortValue: getProductSortValue,
  filters: productFilters,
};
```
## Step 7: Create the Page Component
This is the easiest step. Create a new page component that imports your viewConfig and the GenericDataViewPage.
Create a file like /src/data/your-feature/YourFeatureView.tsx.
### Example: `ProductView.tsx`
```typescript jsx
import { productViewConfig } from './productViewConfig.tsx';
import GenericDataViewPage from '../../pages/GenericDataViewPage.tsx';
import type { Product, ProductSortKey } from './productTypes.ts';

export default function ProductView() {
  // Pass the config and explicit types to the generic page
  return <GenericDataViewPage<Product, ProductSortKey> viewConfig={productViewConfig} />;
}
```
## Step 8: Add the Route and Menu Link
Finally, add a route for your new page in your main router (e.g., App.tsx) and a link to it in the main menu (e.g., Menu.tsx).
By following these steps, you can quickly and cleanly add new data views to the application, leveraging the reusable architecture to minimize boilerplate and ensure consistency.

A fully functioning version of the Product example can be found in /src/data/products/ . Alongside another example under /src/data/stop-places.

---

Known design ambiguities in the current code are tracked separately in [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md).
