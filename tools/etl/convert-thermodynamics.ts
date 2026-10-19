import type { FoodPhysicsClass } from '../../src/app/core/models/recipe-taxonomy.model.ts';

export type RawHeatSourceType =
  | 'native_air_fryer'
  | 'static_oven'
  | 'fan_oven_eu'
  | 'convection_oven_us'
  | 'deep_fryer'
  | 'microwave';

export interface EmpiricalConversionOutput {
  readonly baseTempC: number;
  readonly baseTempF: number;
  readonly cookMin: number;
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Converts a recipe's original heat-source temperature and time into a normalized
 * canonical Air Fryer profile (5L, 1500W, bare basket) following thermodynamic laws.
 */
export function convertToCanonicalAirFryer(
  sourceType: RawHeatSourceType,
  sourceTempC: number,
  sourceTimeMin: number,
  physicsClass: FoodPhysicsClass,
  maxHardwareCeilingC: number = 200
): EmpiricalConversionOutput {
  if (sourceType === 'native_air_fryer') {
    const tempC = Math.min(roundToStep(sourceTempC, 5), maxHardwareCeilingC);
    return {
      baseTempC: tempC,
      baseTempF: roundToStep((tempC * 9) / 5 + 32, 5),
      cookMin: Math.max(1, Math.round(sourceTimeMin)),
    };
  }

  if (sourceType === 'deep_fryer') {
    const tempC = 195;
    return {
      baseTempC: tempC,
      baseTempF: roundToStep((tempC * 9) / 5 + 32, 5),
      cookMin: Math.max(1, Math.round(sourceTimeMin * 2.0)),
    };
  }

  if (sourceType === 'microwave') {
    const tempC = 190;
    return {
      baseTempC: tempC,
      baseTempF: roundToStep((tempC * 9) / 5 + 32, 5),
      cookMin: Math.max(1, Math.round(sourceTimeMin * 3.0)),
    };
  }

  let tempDeltaC = -15;
  let timeFactor = 0.8;

  if (sourceType === 'fan_oven_eu') {
    tempDeltaC = 0;
    timeFactor = 0.9;
  } else if (sourceType === 'convection_oven_us') {
    tempDeltaC = -5;
    timeFactor = 0.9;
  } else if (physicsClass === 'bakery_pastry_dough') {
    tempDeltaC = -20;
    timeFactor = 0.8;
  } else if (physicsClass === 'frozen_precooked') {
    tempDeltaC = -15;
    timeFactor = 0.92;
  }

  const theoreticalTempC = roundToStep(sourceTempC + tempDeltaC, 5);
  const clippedTempC = Math.min(theoreticalTempC, maxHardwareCeilingC);

  const deficitBonusMin =
    theoreticalTempC > maxHardwareCeilingC
      ? 1.5 * ((theoreticalTempC - maxHardwareCeilingC) / 11)
      : 0;

  const cookMin = Math.max(1, Math.round(sourceTimeMin * timeFactor + deficitBonusMin));

  return {
    baseTempC: clippedTempC,
    baseTempF: roundToStep((clippedTempC * 9) / 5 + 32, 5),
    cookMin,
  };
}

