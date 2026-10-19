---
name: recipe-authoring
description: >-
  Add, convert, calibrate, and partition Air Fryer recipes in CrispCraft.
  Trigger whenever the user asks to add new recipes, import recipe datasets,
  expand regional ingredient synonyms (es-ES / es-LATAM), or rebuild the
  partitioned JSON catalog shards.
---

# CrispCraft Recipe Authoring & ETL Skill

Use this skill whenever adding, importing, or updating Air Fryer recipes in `CrispCraft`.

---

## 1. Where Recipes Live

1. **Canonical Source of Truth**: `tools/etl/seed-recipes.data.ts`
   - Contains `CANONICAL_INGREDIENTS` (ID $\to$ display label)
   - Contains `INGREDIENT_SYNONYMS` (ID $\to$ `es-ES` and `es-LATAM` search terms)
   - Contains `SEED_RECIPES: readonly RecipeDetail[]`
2. **Thermodynamic Helper**: `tools/etl/convert-thermodynamics.ts`
   - Provides `buildStandardScalingCurve(referenceLoadG)` and `convertStaticOvenToAirFryer(ovenTempC, ovenMin, foodClass)` for converting conventional oven recipes into calibrated `5-6L / 1500W` Air Fryer baselines.
3. **Shard Builder Script**: `tools/etl/build-shards.ts`
   - Partitions `SEED_RECIPES` into chunks of 25 recipes (`public/data/shards/recipes-shard-XX.json`) and generates the lightweight startup index (`public/data/catalog-index.v1.json`).

---

## 2. Canonical Baseline Calibration Rules

Every recipe in `SEED_RECIPES` MUST be calibrated for the **Canonical Reference Air Fryer**:
- **Basket Capacity**: `5–6 L` (`standard_5_to_6l`)
- **Nominal Power**: `1500 W`
- **Heating Element**: Single top element (`hasDualHeatingElement: false`)
- **Accessory**: Bare perforated basket (`none`)

### Selecting `foodPhysicsClass`
Choose the most accurate thermodynamic class for `afProfile.foodPhysicsClass`:
- `lean_protein`: Chicken breast, turkey, white fish, prawns, tofu.
- `lean_protein_with_topping`: Stuffed or gratin proteins where top browning speed matters.
- `fatty_protein`: Chicken wings, thighs, salmon, pork ribs, chorizo, burgers.
- `root_vegetables_bastons`: Potatoes, sweet potatoes, yuca, plantain bastons/wedges.
- `tender_vegetables`: Broccoli, asparagus, zucchini, peppers, mushrooms, eggplant.
- `battered_or_breaded`: Croquettes, empanadas, milanesas, breaded calamari, nuggets.
- `bakery_pastry_dough`: Cheesecake, muffins, churros, cookies, puff pastry, bread rolls.
- `frozen_precooked`: Direct-from-freezer snacks or vegetables.
- `reheat_crispy`: Pizza slices, fried chicken, or pastry regeneration.

---

## 3. Step-by-Step Workflow to Add Recipes

1. **Register Missing Ingredients**:
   - Check `CANONICAL_INGREDIENTS` in `tools/etl/seed-recipes.data.ts`.
   - If a recipe uses a new main ingredient, add its canonical snake_case ID (e.g., `platano_macho`) to `CANONICAL_INGREDIENTS` and add both Spain (`es-ES`) and Latin America (`es-LATAM`) synonyms to `INGREDIENT_SYNONYMS`.
2. **Author the `RecipeDetail` Object**:
   - Assign a sequential `id` (`af_0013`, `af_0014`, ...) and URL-friendly `slug`.
   - Ensure `searchIndex.mainIngIds` references valid keys in `CANONICAL_INGREDIENTS`.
   - Mark active Air Fryer cooking steps with `isAirFryerActivePhase: true` and `timerSec: <seconds>` so the compensator scales step durations automatically.
   - Include at least one mid-cycle `actionTriggers` entry (`shake_basket`, `flip_food`, `flip_and_spray`, or `add_topping`) with `pctTrigger` between `0.4` and `0.85`.
3. **Run the ETL Pipeline & Verify**:
   ```bash
   pnpm run etl:build
   pnpm test
   pnpm run build
   ```

