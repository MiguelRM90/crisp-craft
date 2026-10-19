import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompensatedCooking,
  calculateQuickConversion,
} from './cooking-compensator.engine.ts';
import { DEFAULT_HARDWARE_PROFILE } from '../models/air-fryer-profile.model.ts';
import type { RecipeDetail } from '../models/recipe-detail.model.ts';
import { SEED_RECIPES } from '../../../../tools/etl/seed-recipes.data.ts';

const SAMPLE_RECIPE: RecipeDetail = {
  ...SEED_RECIPES[0],
  shardId: 'shard-01',
};

describe('CookingCompensatorEngine', () => {
  it('returns baseline parameters for canonical 5-6L / 1500W / bare basket', () => {
    const result = calculateCompensatedCooking(SAMPLE_RECIPE, DEFAULT_HARDWARE_PROFILE, null);

    assert.equal(result.effectiveTempC, 180);
    assert.equal(result.effectiveCookMin, 15);
    assert.equal(result.isBatchWarningActive, false);
    assert.equal(result.batchSplitPlan, null);
    assert.equal(result.triggers.length, 2);
    assert.equal(result.triggers[0].compensatedMinuteMark, 8);
    assert.equal(result.triggers[1].compensatedMinuteMark, 11);
  });

  it('increases cooking time and temperature when using a silicone mold in a compact <4L fryer', () => {
    const compactSiliconeProfile = {
      ...DEFAULT_HARDWARE_PROFILE,
      basketCapacity: 'compact_under_4l' as const,
      nominalPowerWatts: 1000,
      defaultAccessory: 'silicone_mold' as const,
    };

    const result = calculateCompensatedCooking(SAMPLE_RECIPE, compactSiliconeProfile, null);

    assert.equal(result.effectiveTempC, 185);
    assert.ok(result.effectiveCookMin > 15, 'Expected cooking time to increase for compact + silicone');
    assert.equal(result.isBatchWarningActive, true, '800g exceeds 450g single-layer limit on <4L');
    assert.ok(result.batchSplitPlan !== null);
    assert.equal(result.batchSplitPlan?.recommendedBatches, 2);
    assert.equal(result.batchSplitPlan?.loadPerBatchG, 400);
    assert.ok(
      result.batchSplitPlan!.subsequentBatchCookMin < result.batchSplitPlan!.firstBatchCookMin,
      'Subsequent batch should be faster due to chamber thermal inertia'
    );
  });

  it('reduces cooking time and suppresses flip_food trigger when dual heating element is enabled', () => {
    const wingsRecipe: RecipeDetail = {
      ...SEED_RECIPES[3],
      shardId: 'shard-01',
    };
    const dualBlazeProfile = {
      ...DEFAULT_HARDWARE_PROFILE,
      basketCapacity: 'large_over_6l' as const,
      nominalPowerWatts: 2000,
      hasDualHeatingElement: true,
    };

    const result = calculateCompensatedCooking(wingsRecipe, dualBlazeProfile, null);

    assert.ok(result.effectiveCookMin < 20);
    const flipTrigger = result.triggers.find((t) => t.type === 'flip_food');
    assert.equal(flipTrigger?.suppressedByDualElement, true);
  });

  it('prioritizes Personal Fork overrides when user locks time or temperature', () => {
    const result = calculateCompensatedCooking(SAMPLE_RECIPE, DEFAULT_HARDWARE_PROFILE, {
      recipeId: SAMPLE_RECIPE.id,
      isFavorite: true,
      customCookMinOverride: 12,
      customTempCOverride: 170,
      personalNotes: 'Se me quema a los 12 min',
      stepNotes: {},
      timesCooked: 2,
      updatedAtIso: '2026-10-19T12:00:00.000Z',
    });

    assert.equal(result.isOverriddenByPersonalFork, true);
    assert.equal(result.effectiveCookMin, 12);
    assert.equal(result.effectiveTempC, 170);
  });

  it('converts static oven and frozen bag instructions via calculateQuickConversion', () => {
    const ovenConv = calculateQuickConversion(
      {
        sourceMode: 'static_oven_standard',
        sourceTempC: 200,
        sourceTimeMin: 25,
      },
      DEFAULT_HARDWARE_PROFILE
    );

    assert.equal(ovenConv.effectiveTempC, 185);
    assert.equal(ovenConv.effectiveCookMin, 20);
    assert.equal(ovenConv.shakeMinuteMark, 10);

    const frozenConv = calculateQuickConversion(
      {
        sourceMode: 'frozen_package',
        sourceTempC: 200,
        sourceTimeMin: 20,
      },
      DEFAULT_HARDWARE_PROFILE
    );

    assert.equal(frozenConv.effectiveTempC, 185);
    assert.equal(frozenConv.effectiveCookMin, 18);
  });
});

