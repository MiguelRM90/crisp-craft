import { BasketAccessoryType, BasketCapacityTier } from './air-fryer-profile.model';

export interface CommunityTipEntry {
  readonly tipId: string;
  readonly authorUid: string;
  readonly authorAlias: string;
  readonly basketCapacity: BasketCapacityTier;
  readonly hasDualHeatingElement: boolean;
  readonly accessoryUsed: BasketAccessoryType;
  readonly suggestedTempDeltaC: -15 | -10 | -5 | 0 | 5 | 10;
  readonly suggestedTimeDeltaMin: number;
  readonly comment: string;
  readonly helpfulCount: number;
  readonly createdAtIso: string;
}

export interface RecipeTipsBundleDocument {
  readonly recipeId: string;
  readonly totalTipsCount: number;
  readonly avgTempDeltaC: number;
  readonly avgTimeDeltaMin: number;
  readonly updatedAtIso: string;
  readonly topTips: readonly CommunityTipEntry[];
}

export interface CachedRecipeTipsBundle {
  readonly recipeId: string;
  readonly fetchedAtMs: number;
  readonly expiresAtMs: number;
  readonly payload: RecipeTipsBundleDocument;
}

