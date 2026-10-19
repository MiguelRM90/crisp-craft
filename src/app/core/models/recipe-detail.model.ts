import {
  ActionTriggerType,
  AdaptationSourceType,
  FoodPhysicsClass,
  LanguageCode,
  MeasurementUnit,
  NutriScoreGrade,
  OriginRegion,
} from './recipe-taxonomy.model';
import { RecipeSearchIndexMetrics } from './recipe-index.model';

export interface RecipeSourceMeta {
  readonly adaptationType: AdaptationSourceType;
  readonly license:
    | 'OpenRAIL'
    | 'CC-BY-4.0'
    | 'CC0-1.0'
    | 'ODbL-1.0'
    | 'Factual-TRLPI-Art10';
  readonly canonicalRef: string;
}

export interface HardwarePowerMultipliers {
  readonly compact1000w3l: number;
  readonly standard1500w5l: number;
  readonly highPower2000w6l: number;
}

export interface MassScalingPoint {
  readonly loadG: number;
  readonly timeFactor: number;
  readonly batchWarning?: boolean;
}

export interface ActionTrigger {
  readonly type: ActionTriggerType;
  readonly pctTrigger: number;
  readonly defaultMin: number;
  readonly label: string;
}

export interface AirFryerPhysicsProfile {
  readonly baseTempC: number;
  readonly baseTempF: number;
  readonly preheatMin: number;
  readonly singleLayerRequired: boolean;
  readonly oilSprayRequired: boolean;
  readonly foodPhysicsClass: FoodPhysicsClass;
  readonly referenceLoadG: number;
  readonly hardwareMultipliers: HardwarePowerMultipliers;
  readonly massScalingCurve: readonly MassScalingPoint[];
  readonly actionTriggers: readonly ActionTrigger[];
}

export interface IngredientItem {
  readonly id: string;
  readonly name: string;
  readonly qty: number;
  readonly unit: MeasurementUnit;
  readonly optional?: boolean;
}

export interface IngredientGroup {
  readonly purpose: string;
  readonly items: readonly IngredientItem[];
}

export interface RecipeStep {
  readonly step: number;
  readonly text: string;
  readonly timerSec?: number;
  readonly isAirFryerActivePhase?: boolean;
}

export interface NutritionPerServing {
  readonly kcal: number;
  readonly proteinG: number;
  readonly fatG: number;
  readonly carbsG: number;
  readonly fiberG?: number;
  readonly nutriscoreEst?: NutriScoreGrade;
  readonly dataSource: string;
}

export interface RecipeDetail {
  readonly id: string;
  readonly shardId: string;
  readonly slug: string;
  readonly title: string;
  readonly lang: LanguageCode;
  readonly originRegion: OriginRegion;
  readonly sourceMeta: RecipeSourceMeta;
  readonly searchIndex: RecipeSearchIndexMetrics;
  readonly afProfile: AirFryerPhysicsProfile;
  readonly ingredientGroups: readonly IngredientGroup[];
  readonly steps: readonly RecipeStep[];
  readonly nutritionPerServing: NutritionPerServing;
}

export interface RecipeShardPayload {
  readonly shardId: string;
  readonly version: string;
  readonly recipes: Readonly<Record<string, RecipeDetail>>;
}

