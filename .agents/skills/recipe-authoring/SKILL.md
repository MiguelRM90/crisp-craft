---
name: recipe-authoring
description: >-
  Add, calibrate, and partition tested Air Fryer recipes in CrispCraft.
  Trigger whenever the user asks to add new recipes, expand the modular catalog,
  or rebuild the partitioned JSON catalog shards.
---

# CrispCraft Recipe Authoring & ETL Skill

Use this skill whenever adding or updating Air Fryer recipes in `CrispCraft`.

---

## 1. Golden Rules (Strict Invariants)

1. **100% Peninsular Spanish (`es-ES` Only)**:
   - All recipe titles, ingredients, steps, and synonyms MUST use natural Spanish from Spain (`patata`, `boniato`, `calabacín`, `aguacate`, `langostinos`, `jamón ibérico`).
   - **Never** use Latin American regionalisms (`papa`, `camote`, `zucchini`, `palta`, `camarón`, `patacón`, `tostones`, etc.).
   - Always set `lang: 'es-ES'` and `originRegion: 'ES'`.
2. **100% Native, Tested Air Fryer Recipes Only (`native_air_fryer`)**:
   - Every recipe added to the catalog MUST be a genuine, tested Air Fryer recipe designed specifically for Air Fryer air circulation, basket capacity, and oil-spray dynamics.
   - Do **not** include untested theoretical oven conversions. Always set `sourceMeta.adaptationType: 'native_air_fryer'`.

---

## 2. Modular Catalog Architecture (`tools/etl/catalog/`)

Recipes are modularized by culinary category inside `tools/etl/catalog/`:
- `ingredients.data.ts`: `CANONICAL_INGREDIENTS_MAP` and `INGREDIENT_SYNONYMS_MAP`.
- `carnes-y-aves.data.ts`: Poultry, pork, beef, and lamb recipes.
- `pescados-y-mariscos.data.ts`: Fish and seafood recipes.
- `verduras-y-guarniciones.data.ts`: Vegetables, potatoes, and side dishes.
- `aperitivos-y-snacks.data.ts`: Tapas, croquettes, and crispy snacks.
- `reposteria-y-dulces.data.ts`: Cheesecakes, baked fruit, and pastries.
- `index.ts`: Aggregates all category arrays into `SEED_RECIPES`.

---

## 3. Canonical Baseline Calibration Rules

Every recipe MUST be calibrated for the **Canonical Reference Air Fryer**:
- **Basket Capacity**: `5–6 L` (`standard_5_to_6l`)
- **Nominal Power**: `1500 W`
- **Heating Element**: Single top element (`hasDualHeatingElement: false`)
- **Accessory**: Bare perforated basket (`none`)

### Selecting `foodPhysicsClass`
Choose the most accurate thermodynamic class for `afProfile.foodPhysicsClass`:
- `lean_protein`: Chicken breast, turkey, white fish, prawns, tofu.
- `lean_protein_with_topping`: Stuffed or gratin proteins where top browning speed matters.
- `fatty_protein`: Chicken wings, thighs, salmon, pork ribs, chorizo, burgers.
- `root_vegetables_bastons`: Potatoes, sweet potatoes wedges/fries.
- `tender_vegetables`: Broccoli, asparagus, zucchini, peppers, mushrooms, eggplant.
- `battered_or_breaded`: Croquettes, empanadillas, San Jacobos, breaded calamari, nuggets.
- `bakery_pastry_dough`: Basque cheesecake, muffins, torrijas, cookies, puff pastry.
- `frozen_precooked`: Direct-from-freezer snacks or vegetables.
- `reheat_crispy`: Pizza slices or pastry regeneration.

---

## 4. Step-by-Step Workflow to Add Recipes

1. **Register Missing Ingredients**:
   - Check `CANONICAL_INGREDIENTS_MAP` in `tools/etl/catalog/ingredients.data.ts`.
   - Add any new canonical snake_case ID and its `es-ES` plural/common search variants in `INGREDIENT_SYNONYMS_MAP`.
2. **Add the `RecipeDetail` to the Category Module**:
   - Append the recipe to the appropriate file in `tools/etl/catalog/*.data.ts`.
   - Mark active Air Fryer cooking steps with `isAirFryerActivePhase: true` and `timerSec: <seconds>`.
   - Include mid-cycle `actionTriggers` (`shake_basket`, `flip_food`, `flip_and_spray`, `add_topping`, or `check_doneness`).
3. **Rebuild Shards & Verify**:
   ```bash
   pnpm run etl:build
   pnpm test
   pnpm run build
   ```
