import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CatalogIndexManifest,
  RecipeIndexItem,
} from '../../src/app/core/models/recipe-index.model.ts';
import type {
  RecipeDetail,
  RecipeShardPayload,
} from '../../src/app/core/models/recipe-detail.model.ts';
import {
  CANONICAL_INGREDIENTS_MAP,
  INGREDIENT_SYNONYMS_MAP,
  SEED_RECIPES,
} from './seed-recipes.data.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DATA_DIR = resolve(__dirname, '../../public/data');
const SHARDS_DIR = resolve(PUBLIC_DATA_DIR, 'shards');
const RECIPES_PER_SHARD = 6;
const CATALOG_VERSION = '1.0.0';

function buildCatalogAndShards(): void {
  mkdirSync(SHARDS_DIR, { recursive: true });

  const indexItems: RecipeIndexItem[] = [];
  const shardBuckets = new Map<string, Record<string, RecipeDetail>>();

  SEED_RECIPES.forEach((rawRecipe, idx) => {
    const shardNumber = Math.floor(idx / RECIPES_PER_SHARD) + 1;
    const shardId = `shard-${String(shardNumber).padStart(2, '0')}`;

    const fullRecipe: RecipeDetail = {
      ...rawRecipe,
      shardId,
    };

    const bucket = shardBuckets.get(shardId) ?? {};
    bucket[fullRecipe.id] = fullRecipe;
    shardBuckets.set(shardId, bucket);

    indexItems.push({
      id: fullRecipe.id,
      shardId,
      slug: fullRecipe.slug,
      title: fullRecipe.title,
      originRegion: fullRecipe.originRegion,
      baseTempC: fullRecipe.afProfile.baseTempC,
      foodPhysicsClass: fullRecipe.afProfile.foodPhysicsClass,
      kcalPerServing: fullRecipe.nutritionPerServing.kcal,
      nutriscoreEst: fullRecipe.nutritionPerServing.nutriscoreEst,
      searchIndex: fullRecipe.searchIndex,
    });
  });

  for (const [shardId, recipes] of shardBuckets.entries()) {
    const shardPayload: RecipeShardPayload = {
      shardId,
      version: CATALOG_VERSION,
      recipes,
    };
    const shardPath = resolve(SHARDS_DIR, `recipes-${shardId}.json`);
    writeFileSync(shardPath, JSON.stringify(shardPayload, null, 2), 'utf-8');
  }

  const manifest: CatalogIndexManifest = {
    version: CATALOG_VERSION,
    generatedAtIso: new Date().toISOString(),
    totalRecipes: indexItems.length,
    shardCount: shardBuckets.size,
    canonicalIngredients: CANONICAL_INGREDIENTS_MAP,
    ingredientSynonyms: INGREDIENT_SYNONYMS_MAP,
    items: indexItems,
  };

  const manifestPath = resolve(PUBLIC_DATA_DIR, 'catalog-index.v1.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(
    `[ETL] Generated catalog-index.v1.json (${manifest.totalRecipes} recipes across ${manifest.shardCount} shards).`
  );
}

buildCatalogAndShards();

