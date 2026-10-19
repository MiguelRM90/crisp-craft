# AGENTS.md — AI Engineering Guidelines for CrispCraft

This document provides architectural context, coding conventions, and operational invariants for AI coding agents working in the **CrispCraft** repository.

---

## 1. Architecture Overview

**CrispCraft** is a Local-First Progressive Web Application (PWA) built with **Angular 22**, **TypeScript (`strict: true`)**, **IndexedDB (`idb`)**, and the local **`pwa-ui-core`** design system.

### Core Principles
- **Zoneless & Signal-First**: Uses `provideZonelessChangeDetection()`. All state is managed via Angular Signals (`signal`, `computed`, `effect`, `input`, `output`).
- **Component Separation**: Every component MUST be split into independent `.ts`, `.html`, and `.css` files (`templateUrl` and `styleUrl`) with `ChangeDetectionStrategy.OnPush`. Never use inline templates or inline styles.
- **Zero `any` & Strict TypeScript**: `any` is strictly forbidden. Use explicit interfaces, discriminated unions, and `readonly` properties across all models and payloads.
- **Zero Tailwind CSS**: Styling relies exclusively on `pwa-ui-core` (`@import "pwa-ui-core/styles";`) and component-scoped native CSS variables defined in `src/styles.css`.
- **Package Manager**: Always use `pnpm` (`pnpm run <script>`).

---

## 2. Domain & Thermodynamic Engine (`src/app/core/`)

- **Models (`src/app/core/models/`)**:
  - `recipe-taxonomy.model.ts`: Canonical enums/unions (`FoodPhysicsClass`, `MealCategory`, `DietTag`, `ActionTriggerType`, `OriginRegion`).
  - `recipe-index.model.ts`: Lightweight `RecipeIndexItem` and `CatalogIndexManifest` loaded at startup.
  - `recipe-detail.model.ts`: Full `RecipeDetail` and `AirFryerPhysicsProfile` stored inside lazy shards.
  - `air-fryer-profile.model.ts`: User hardware settings (`AirFryerHardwareProfile`).
  - `personal-fork.model.ts`: User overrides (`RecipePersonalFork`) and `CompensatedCookingParameters`.
  - `community-tip.model.ts`: Quota-safe Firestore bundle (`RecipeTipsBundleDocument`).
- **Thermodynamic Engine (`src/app/core/engines/cooking-compensator.engine.ts`)**:
  - Pure, stateless functions (`calculateCompensatedCooking`, `estimateIndexCardCooking`, `calculateQuickConversion`).
  - Always keep `cooking-compensator.engine.ts` free of Angular DI or DOM dependencies so it runs directly in Node.js via `pnpm test` (`node --experimental-strip-types --test src/**/*.spec.ts`).
  - Any modification to thermodynamic formulas MUST be accompanied by unit tests in `cooking-compensator.engine.spec.ts`.

---

## 3. Data Pipeline & Adding Recipes (`tools/etl/`)

Static JSON files under `public/data/` (`catalog-index.v1.json` and `public/data/shards/recipes-shard-*.json`) are **build artifacts** generated from `tools/etl/seed-recipes.data.ts`.

- **Never edit `public/data/*.json` manually.**
- To add or modify recipes, edit `tools/etl/seed-recipes.data.ts` and run `pnpm run etl:build`.
- Refer to the workspace skill `.agents/skills/recipe-authoring/SKILL.md` for step-by-step instructions on authoring thermodynamically calibrated recipes.

---

## 4. Verification Gates

Before completing any task that modifies code or data, run:

```bash
pnpm run etl:build
pnpm test
pnpm run build
```

