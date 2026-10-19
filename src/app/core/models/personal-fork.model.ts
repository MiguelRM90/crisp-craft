import { BasketAccessoryType } from './air-fryer-profile.model';
import { ActionTrigger, RecipeDetail, RecipeStep } from './recipe-detail.model';

export interface RecipePersonalFork {
  readonly recipeId: string;
  readonly isFavorite: boolean;
  readonly customCookMinOverride?: number;
  readonly customTempCOverride?: number;
  readonly customServingsOverride?: number;
  readonly personalNotes: string;
  readonly stepNotes: Readonly<Record<number, string>>;
  readonly personalRating?: 1 | 2 | 3 | 4 | 5;
  readonly timesCooked: number;
  readonly lastCookedAtIso?: string;
  readonly updatedAtIso: string;
}

export interface CompensatedActionTrigger extends ActionTrigger {
  readonly compensatedMinuteMark: number;
  readonly compensatedSecondMark: number;
  readonly suppressedByDualElement: boolean;
}

export interface MultiBatchSplitPlan {
  readonly recommendedBatches: number;
  readonly loadPerBatchG: number;
  readonly firstBatchCookMin: number;
  readonly subsequentBatchCookMin: number;
}

export interface CompensatedCookingParameters {
  readonly effectiveTempC: number;
  readonly effectiveTempF: number;
  readonly effectiveCookMin: number;
  readonly effectiveCookSec: number;
  readonly effectivePreheatMin: number;
  readonly targetLoadG: number;
  readonly isBatchWarningActive: boolean;
  readonly batchSplitPlan: MultiBatchSplitPlan | null;
  readonly isThermalCeilingClipped: boolean;
  readonly isOverriddenByPersonalFork: boolean;
  readonly activeAccessory: BasketAccessoryType;
  readonly totalTimeMultiplier: number;
  readonly tempDeltaC: number;
  readonly triggers: readonly CompensatedActionTrigger[];
  readonly compensatedSteps: readonly RecipeStep[];
}

export interface ResolvedRecipeView {
  readonly recipe: RecipeDetail;
  readonly compensation: CompensatedCookingParameters;
  readonly fork: RecipePersonalFork | null;
}

export type QuickConvertSourceMode =
  | 'static_oven_standard'
  | 'static_oven_bakery'
  | 'frozen_package'
  | 'fan_oven_eu';

export interface QuickConverterInput {
  readonly sourceMode: QuickConvertSourceMode;
  readonly sourceTempC: number;
  readonly sourceTimeMin: number;
}

export interface QuickConverterResult {
  readonly effectiveTempC: number;
  readonly effectiveTempF: number;
  readonly effectiveCookMin: number;
  readonly shakeMinuteMark: number;
  readonly preheatMin: number;
}

