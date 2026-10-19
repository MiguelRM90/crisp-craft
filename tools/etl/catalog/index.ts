import type { RecipeDetail } from '../../../src/app/core/models/recipe-detail.model.ts';
import { APERITIVOS_Y_SNACKS_RECIPES } from './aperitivos-y-snacks.data.ts';
import { CARNES_Y_AVES_RECIPES } from './carnes-y-aves.data.ts';
import { CANONICAL_INGREDIENTS_MAP, INGREDIENT_SYNONYMS_MAP } from './ingredients.data.ts';
import { PESCADOS_Y_MARISCOS_RECIPES } from './pescados-y-mariscos.data.ts';
import { REPOSTERIA_Y_DULCES_RECIPES } from './reposteria-y-dulces.data.ts';
import { VERDURAS_Y_GUARNICIONES_RECIPES } from './verduras-y-guarniciones.data.ts';

export { CANONICAL_INGREDIENTS_MAP, INGREDIENT_SYNONYMS_MAP };

export const SEED_RECIPES: readonly Omit<RecipeDetail, 'shardId'>[] = [
  ...CARNES_Y_AVES_RECIPES,
  ...PESCADOS_Y_MARISCOS_RECIPES,
  ...VERDURAS_Y_GUARNICIONES_RECIPES,
  ...APERITIVOS_Y_SNACKS_RECIPES,
  ...REPOSTERIA_Y_DULCES_RECIPES,
].sort((a, b) => a.id.localeCompare(b.id));
