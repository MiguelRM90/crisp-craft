# CrispCraft — Thermodynamic Air Fryer PWA

**CrispCraft** is a Local-First, zero-cost Progressive Web Application (PWA) built with **Angular 22** and **TypeScript (strict)**. It dynamically recalculates Air Fryer cooking times, temperatures, batch split plans, and mid-cycle basket actions based on your specific Air Fryer hardware and accessories.

---

## Key Features

- **Thermodynamic Cooking Compensator**: Adjusts recipe temperature ($5\,^\circ\text{C}$ steps), duration, and active step timers according to:
  - **Basket Capacity Tier**: Compact ($<4\text{ L}$), Standard ($5\text{--}6\text{ L}$), or Large ($>6\text{ L}$).
  - **Nominal Power ($800\text{--}2400\text{ W}$)** & **Dual-Basket Shared Power** penalty.
  - **Dual Heating Element** (top + bottom resistance) with automatic suppression of redundant `flip_food` alerts.
  - **Accessory / Liner Selection**: Bare basket, perforated parchment, paper bowl liner, silicone mold, or metal pan.
  - **Non-Linear Mass Scaling & Multi-Batch Split Planner**: Detects single-layer basket overcrowding and generates a multi-batch cooking plan with a $-10\%$ hot-basket time reduction for subsequent batches.
- **Partitioned Static Catalog + IndexedDB (`idb`)**:
  - Ultra-lightweight startup index (`public/data/catalog-index.v1.json`) for instant search, `es-ES` / `es-LATAM` regional synonym matching, and **Reverse Pantry ("¿Qué tengo en la nevera?")** filtering.
  - Lazy-loaded recipe shards (`public/data/shards/recipes-shard-XX.json`) cached in IndexedDB and via Angular Service Worker (`ngsw`).
- **Standalone Quick Converter Modal**: Instant conversion from Conventional Static Oven, Convection Oven, or Frozen Package instructions to your configured Air Fryer profile with 1-click timer launch.
- **Personal Fork Mode**: Override cooking minutes or temperature, record personal notes, rate recipes ($1\text{--}5$ stars), and export/import full JSON backups locally.
- **Drift-Free Interactive Cooking Timer**: Wall-clock delta timer (`EpochMs`), Screen Wake Lock (`navigator.wakeLock`), background tab catch-up recovery (`visibilitychange`), Web Audio API synthesized chimes, and Service Worker notifications.
- **Quota-Safe Community Tips**: Optional Firestore Spark Plan integration using the `1 Recipe = 1 Document` bundle pattern (`recipe_tip_bundles/{recipeId}`), 7-day IndexedDB TTL cache, and lazy `@defer (on interaction)` loading.

---

## Tech Stack

- **Framework**: Angular 22 (Zoneless Signals, Standalone Components, `@if`/`@for`/`@defer`, `ChangeDetectionStrategy.OnPush`)
- **Design System**: `pwa-ui-core` (Zero Tailwind CSS; semantic CSS custom properties)
- **Local Storage**: IndexedDB via `idb` v8 + `sessionStorage` timer persistence
- **Package Manager**: `pnpm`

---

## Development & Build Commands

```bash
# Start local development server
pnpm start

# Regenerate partitioned JSON catalog & shards from ETL seed data
pnpm run etl:build

# Run unit tests (Node native TypeScript test runner)
pnpm test

# Build production PWA bundle
pnpm run build

# Build production bundle configured for GitHub Pages (/crisp-craft/)
pnpm run build:gh-pages
```

---

## Project Structure

```text
crisp-craft/
├── .agents/skills/recipe-authoring/ # AI Skill for adding & validating Air Fryer recipes
├── public/
│   ├── data/
│   │   ├── catalog-index.v1.json    # Generated lightweight search & pantry index
│   │   └── shards/                  # Generated lazy-loaded recipe detail shards
│   └── manifest.webmanifest         # Standalone PWA manifest
├── src/app/
│   ├── core/
│   │   ├── engines/                 # Pure thermodynamic compensator engine + unit tests
│   │   ├── models/                  # Strict TypeScript domain interfaces & taxonomies
│   │   └── services/                # IndexedDB wrapper & reactive Signal stores
│   ├── shared/
│   │   ├── components/              # AppHeader, HardwareQuickBar, FloatingTimerPill
│   │   └── pipes/                   # DurationFormatPipe, TemperatureUnitPipe
│   └── features/
│       ├── catalog/                 # Search, Reverse Pantry picker, deferred recipe cards
│       ├── hardware-settings/       # Air Fryer profile configurator & JSON backup modal
│       ├── quick-converter/         # Oven / Frozen package to Air Fryer converter modal
│       └── recipe-detail/           # Compensated recipe view, timer, Personal Fork & tips
└── tools/etl/
    ├── convert-thermodynamics.ts    # Oven-to-Air-Fryer physics helper
    ├── seed-recipes.data.ts         # Canonical recipe dataset & regional synonym dictionary
    └── build-shards.ts              # Deterministic shard partitioner script
```

