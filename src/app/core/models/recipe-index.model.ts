import {
  DifficultyLevel,
  DietTag,
  FoodPhysicsClass,
  MealCategory,
  NutriScoreGrade,
  OriginRegion,
} from './recipe-taxonomy.model';

export interface RecipeSearchIndexMetrics {
  readonly prepMin: number;
  readonly cookMin: number;
  readonly totalMin: number;
  readonly difficulty: DifficultyLevel;
  readonly servings: number;
  readonly mealCategory: MealCategory;
  readonly dietTags: readonly DietTag[];
  readonly mainIngIds: readonly string[];
  readonly ingCount: number;
  readonly stepCount: number;
}

export interface RecipeIndexItem {
  readonly id: string;
  readonly shardId: string;
  readonly slug: string;
  readonly title: string;
  readonly originRegion: OriginRegion;
  readonly baseTempC: number;
  readonly foodPhysicsClass: FoodPhysicsClass;
  readonly kcalPerServing: number;
  readonly nutriscoreEst?: NutriScoreGrade;
  readonly searchIndex: RecipeSearchIndexMetrics;
}

export interface CatalogIndexManifest {
  readonly version: string;
  readonly generatedAtIso: string;
  readonly totalRecipes: number;
  readonly shardCount: number;
  readonly canonicalIngredients: Readonly<Record<string, string>>;
  readonly ingredientSynonyms: Readonly<Record<string, readonly string[]>>;
  readonly items: readonly RecipeIndexItem[];
}

