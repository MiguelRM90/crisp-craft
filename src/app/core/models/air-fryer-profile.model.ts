export type BasketCapacityTier = 'compact_under_4l' | 'standard_5_to_6l' | 'large_over_6l';

export type BasketAccessoryType =
  | 'none'
  | 'perforated_paper'
  | 'bowl_paper_liner'
  | 'silicone_mold'
  | 'metal_baking_pan';

export type TemperatureUnit = 'C' | 'F';

export interface AirFryerHardwareProfile {
  readonly id: string;
  readonly modelAlias: string;
  readonly basketCapacity: BasketCapacityTier;
  readonly nominalPowerWatts: number;
  readonly hasDualHeatingElement: boolean;
  readonly isDualBasketSharedPower: boolean;
  readonly maxTempCelsius: 200 | 205 | 230;
  readonly defaultAccessory: BasketAccessoryType;
  readonly preferredTempUnit: TemperatureUnit;
  readonly enablePreheatingByDefault: boolean;
  readonly updatedAtIso: string;
}

export const BASKET_CAPACITY_LABELS: Readonly<Record<BasketCapacityTier, string>> = {
  compact_under_4l: 'Compacta (< 4 L)',
  standard_5_to_6l: 'Estándar (5 – 6 L)',
  large_over_6l: 'Gran Capacidad (> 6 L)',
};

export const BASKET_ACCESSORY_LABELS: Readonly<Record<BasketAccessoryType, string>> = {
  none: 'Cesta desnuda (Flujo 100%)',
  perforated_paper: 'Papel perforado (+5% t)',
  bowl_paper_liner: 'Bandeja de papel (+10% t)',
  silicone_mold: 'Molde de silicona (+16% t, +5 °C)',
  metal_baking_pan: 'Molde metálico (+6% t)',
};

export const DEFAULT_HARDWARE_PROFILE: AirFryerHardwareProfile = {
  id: 'default_profile',
  modelAlias: 'Mi Freidora Estándar 5.5L',
  basketCapacity: 'standard_5_to_6l',
  nominalPowerWatts: 1500,
  hasDualHeatingElement: false,
  isDualBasketSharedPower: false,
  maxTempCelsius: 200,
  defaultAccessory: 'none',
  preferredTempUnit: 'C',
  enablePreheatingByDefault: true,
  updatedAtIso: '2026-10-19T00:00:00.000Z',
};

