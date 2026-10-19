import type {
  AirFryerHardwareProfile,
  BasketAccessoryType,
  BasketCapacityTier,
} from '../models/air-fryer-profile.model.ts';
import type {
  CompensatedActionTrigger,
  CompensatedCookingParameters,
  MultiBatchSplitPlan,
  QuickConverterInput,
  QuickConverterResult,
  RecipePersonalFork,
} from '../models/personal-fork.model.ts';
import type { MassScalingPoint, RecipeDetail } from '../models/recipe-detail.model.ts';
import type { RecipeIndexItem } from '../models/recipe-index.model.ts';

const ACCESSORY_FACTORS: Readonly<
  Record<BasketAccessoryType, { readonly timeMultiplier: number; readonly tempDeltaC: number }>
> = {
  none: { timeMultiplier: 1.0, tempDeltaC: 0 },
  perforated_paper: { timeMultiplier: 1.05, tempDeltaC: 0 },
  bowl_paper_liner: { timeMultiplier: 1.1, tempDeltaC: 0 },
  silicone_mold: { timeMultiplier: 1.16, tempDeltaC: 5 },
  metal_baking_pan: { timeMultiplier: 1.06, tempDeltaC: 0 },
};

const TIER_NOMINAL_WATTS: Readonly<Record<BasketCapacityTier, number>> = {
  compact_under_4l: 1000,
  standard_5_to_6l: 1500,
  large_over_6l: 2000,
};

const SINGLE_LAYER_MAX_LOAD_G: Readonly<Record<BasketCapacityTier, number>> = {
  compact_under_4l: 450,
  standard_5_to_6l: 850,
  large_over_6l: 1200,
};

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function interpolateMassFactor(
  curve: readonly MassScalingPoint[],
  targetLoadG: number
): { readonly factor: number; readonly curveBatchWarning: boolean } {
  if (curve.length === 0) {
    return { factor: 1.0, curveBatchWarning: false };
  }
  const first = curve[0];
  if (targetLoadG <= first.loadG) {
    return { factor: first.timeFactor, curveBatchWarning: Boolean(first.batchWarning) };
  }
  const last = curve[curve.length - 1];
  if (targetLoadG >= last.loadG) {
    return { factor: last.timeFactor, curveBatchWarning: Boolean(last.batchWarning) };
  }
  for (let i = 0; i < curve.length - 1; i++) {
    const left = curve[i];
    const right = curve[i + 1];
    if (targetLoadG >= left.loadG && targetLoadG <= right.loadG) {
      const ratio = (targetLoadG - left.loadG) / (right.loadG - left.loadG);
      const factor = left.timeFactor + ratio * (right.timeFactor - left.timeFactor);
      return {
        factor,
        curveBatchWarning: Boolean(right.batchWarning && ratio > 0.5),
      };
    }
  }
  return { factor: 1.0, curveBatchWarning: false };
}

export function calculateCompensatedCooking(
  recipe: RecipeDetail,
  hardware: AirFryerHardwareProfile,
  fork: RecipePersonalFork | null,
  selectedServings?: number,
  accessoryOverride?: BasketAccessoryType
): CompensatedCookingParameters {
  const { afProfile, searchIndex, steps } = recipe;
  const activeAccessory = accessoryOverride ?? hardware.defaultAccessory;
  const effectiveServings =
    selectedServings ?? fork?.customServingsOverride ?? searchIndex.servings;

  const tierBaseMultiplier =
    hardware.basketCapacity === 'compact_under_4l'
      ? afProfile.hardwareMultipliers.compact1000w3l
      : hardware.basketCapacity === 'large_over_6l'
        ? afProfile.hardwareMultipliers.highPower2000w6l
        : afProfile.hardwareMultipliers.standard1500w5l;

  const nominalWatts = TIER_NOMINAL_WATTS[hardware.basketCapacity];
  const wattTrim = clamp(1 - 0.0003 * (hardware.nominalPowerWatts - nominalWatts), 0.88, 1.15);
  const dualBasketPenalty = hardware.isDualBasketSharedPower ? 1.1 : 1.0;
  const hardwareMultiplier = tierBaseMultiplier * wattTrim * dualBasketPenalty;

  const isBakery = afProfile.foodPhysicsClass === 'bakery_pastry_dough';
  const dualMultiplier = hardware.hasDualHeatingElement ? (isBakery ? 0.94 : 0.9) : 1.0;
  const dualTempDeltaC = hardware.hasDualHeatingElement && isBakery ? -5 : 0;

  const accessorySpec = ACCESSORY_FACTORS[activeAccessory];

  const servingRatio = effectiveServings / Math.max(1, searchIndex.servings);
  const targetLoadG = Math.round(afProfile.referenceLoadG * servingRatio);
  const maxSingleLayerLoadG = SINGLE_LAYER_MAX_LOAD_G[hardware.basketCapacity];
  const { factor: massMultiplier, curveBatchWarning } = interpolateMassFactor(
    afProfile.massScalingCurve,
    targetLoadG
  );

  const isBatchWarningActive =
    curveBatchWarning || (afProfile.singleLayerRequired && targetLoadG > maxSingleLayerLoadG);

  const totalTempDeltaC = dualTempDeltaC + accessorySpec.tempDeltaC;
  const theoreticalTempC = roundToStep(afProfile.baseTempC + totalTempDeltaC, 5);
  const isThermalCeilingClipped = theoreticalTempC > hardware.maxTempCelsius;
  const computedTempC = Math.min(theoreticalTempC, hardware.maxTempCelsius);

  const baseHardwareAndAccMultiplier =
    hardwareMultiplier * dualMultiplier * accessorySpec.timeMultiplier;
  const totalTimeMultiplier = baseHardwareAndAccMultiplier * massMultiplier;
  const rawCookMin = searchIndex.cookMin * totalTimeMultiplier;
  const thermalDeficitBonusMin = isThermalCeilingClipped
    ? 1.5 * ((theoreticalTempC - hardware.maxTempCelsius) / 11)
    : 0;

  const computedCookMin = Math.max(1, Math.round(rawCookMin + thermalDeficitBonusMin));

  let batchSplitPlan: MultiBatchSplitPlan | null = null;
  if (isBatchWarningActive) {
    const recommendedBatches = Math.max(2, Math.ceil(targetLoadG / maxSingleLayerLoadG));
    const loadPerBatchG = Math.round(targetLoadG / recommendedBatches);
    const { factor: singleBatchMassFactor } = interpolateMassFactor(
      afProfile.massScalingCurve,
      loadPerBatchG
    );
    const firstBatchCookMin = Math.max(
      1,
      Math.round(
        searchIndex.cookMin * baseHardwareAndAccMultiplier * singleBatchMassFactor +
          thermalDeficitBonusMin
      )
    );
    const subsequentBatchCookMin = Math.max(1, Math.round(firstBatchCookMin * 0.9));
    batchSplitPlan = {
      recommendedBatches,
      loadPerBatchG,
      firstBatchCookMin,
      subsequentBatchCookMin,
    };
  }

  const isOverriddenByPersonalFork =
    fork?.customCookMinOverride !== undefined || fork?.customTempCOverride !== undefined;
  const effectiveTempC = fork?.customTempCOverride ?? computedTempC;
  const effectiveTempF = roundToStep((effectiveTempC * 9) / 5 + 32, 5);
  const effectiveCookMin = fork?.customCookMinOverride ?? computedCookMin;
  const effectiveCookSec = effectiveCookMin * 60;

  const triggers: CompensatedActionTrigger[] = afProfile.actionTriggers.map((trigger) => {
    const exactSeconds = Math.round(effectiveCookSec * trigger.pctTrigger);
    return {
      ...trigger,
      compensatedMinuteMark: Math.max(1, Math.round(exactSeconds / 60)),
      compensatedSecondMark: exactSeconds,
      suppressedByDualElement:
        hardware.hasDualHeatingElement && trigger.type === 'flip_food',
    };
  });

  const timeScaleRatio = effectiveCookMin / Math.max(1, searchIndex.cookMin);
  const compensatedSteps = steps.map((step) => {
    if (!step.timerSec || !step.isAirFryerActivePhase) {
      return step;
    }
    return {
      ...step,
      timerSec: Math.max(30, roundToStep(step.timerSec * timeScaleRatio, 10)),
    };
  });

  return {
    effectiveTempC,
    effectiveTempF,
    effectiveCookMin,
    effectiveCookSec,
    effectivePreheatMin: hardware.enablePreheatingByDefault ? afProfile.preheatMin : 0,
    targetLoadG,
    isBatchWarningActive,
    batchSplitPlan,
    isThermalCeilingClipped,
    isOverriddenByPersonalFork,
    activeAccessory,
    totalTimeMultiplier: Number(totalTimeMultiplier.toFixed(3)),
    tempDeltaC: effectiveTempC - afProfile.baseTempC,
    triggers,
    compensatedSteps,
  };
}

export function estimateIndexCardCooking(
  item: RecipeIndexItem,
  hardware: AirFryerHardwareProfile,
  fork?: RecipePersonalFork | null
): { readonly effectiveCookMin: number; readonly effectiveTempC: number; readonly isOverridden: boolean } {
  if (fork?.customCookMinOverride !== undefined || fork?.customTempCOverride !== undefined) {
    return {
      effectiveCookMin: fork.customCookMinOverride ?? item.searchIndex.cookMin,
      effectiveTempC: fork.customTempCOverride ?? item.baseTempC,
      isOverridden: true,
    };
  }

  const tierFactor =
    hardware.basketCapacity === 'compact_under_4l'
      ? 1.14
      : hardware.basketCapacity === 'large_over_6l'
        ? 0.9
        : 1.0;
  const isBakery = item.foodPhysicsClass === 'bakery_pastry_dough';
  const dualFactor = hardware.hasDualHeatingElement ? (isBakery ? 0.94 : 0.9) : 1.0;
  const dualBasketFactor = hardware.isDualBasketSharedPower ? 1.1 : 1.0;
  const accSpec = ACCESSORY_FACTORS[hardware.defaultAccessory];

  const effectiveTempC = Math.min(
    roundToStep(item.baseTempC + (hardware.hasDualHeatingElement && isBakery ? -5 : 0) + accSpec.tempDeltaC, 5),
    hardware.maxTempCelsius
  );
  const effectiveCookMin = Math.max(
    1,
    Math.round(
      item.searchIndex.cookMin * tierFactor * dualFactor * dualBasketFactor * accSpec.timeMultiplier
    )
  );

  return {
    effectiveCookMin,
    effectiveTempC,
    isOverridden: false,
  };
}

export function calculateQuickConversion(
  input: QuickConverterInput,
  hardware: AirFryerHardwareProfile
): QuickConverterResult {
  const modeSpecs = {
    static_oven_standard: { tempDeltaC: -15, timeFactor: 0.8 },
    static_oven_bakery: { tempDeltaC: -20, timeFactor: 0.8 },
    frozen_package: { tempDeltaC: -15, timeFactor: 0.92 },
    fan_oven_eu: { tempDeltaC: 0, timeFactor: 0.9 },
  } as const;

  const spec = modeSpecs[input.sourceMode];
  const baseAfTempC = input.sourceTempC + spec.tempDeltaC;
  const baseAfTimeMin = input.sourceTimeMin * spec.timeFactor;

  const tierFactor =
    hardware.basketCapacity === 'compact_under_4l'
      ? 1.12
      : hardware.basketCapacity === 'large_over_6l'
        ? 0.92
        : 1.0;
  const dualFactor = hardware.hasDualHeatingElement ? 0.9 : 1.0;
  const dualBasketFactor = hardware.isDualBasketSharedPower ? 1.1 : 1.0;
  const accSpec = ACCESSORY_FACTORS[hardware.defaultAccessory];

  const effectiveTempC = clamp(
    roundToStep(baseAfTempC + accSpec.tempDeltaC, 5),
    120,
    hardware.maxTempCelsius
  );
  const effectiveTempF = roundToStep((effectiveTempC * 9) / 5 + 32, 5);
  const effectiveCookMin = Math.max(
    1,
    Math.round(baseAfTimeMin * tierFactor * dualFactor * dualBasketFactor * accSpec.timeMultiplier)
  );

  return {
    effectiveTempC,
    effectiveTempF,
    effectiveCookMin,
    shakeMinuteMark: Math.max(1, Math.round(effectiveCookMin * 0.5)),
    preheatMin: hardware.enablePreheatingByDefault ? 4 : 0,
  };
}

