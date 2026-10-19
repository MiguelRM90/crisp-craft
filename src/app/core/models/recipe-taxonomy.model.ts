export type LanguageCode = 'es-ES' | 'es-LATAM';

export type OriginRegion =
  | 'ES'
  | 'MX'
  | 'PE'
  | 'AR'
  | 'CO'
  | 'CL'
  | 'VE'
  | 'UY'
  | 'EC'
  | 'INTL';

export type DifficultyLevel = 1 | 2 | 3;

export type MealCategory =
  | 'aperitivo'
  | 'principal'
  | 'guarnicion'
  | 'reposteria'
  | 'desayuno'
  | 'snack';

export type DietTag =
  | 'alto_en_proteina'
  | 'bajo_en_carbohidratos'
  | 'sin_gluten'
  | 'sin_lactosa'
  | 'sin_huevo'
  | 'vegetariano'
  | 'vegano'
  | 'keto';

export type FoodPhysicsClass =
  | 'lean_protein'
  | 'lean_protein_with_topping'
  | 'fatty_protein'
  | 'root_vegetables_bastons'
  | 'tender_vegetables'
  | 'battered_or_breaded'
  | 'bakery_pastry_dough'
  | 'frozen_precooked'
  | 'reheat_crispy';

export type AdaptationSourceType =
  | 'native_air_fryer'
  | 'oven_converted_and_verified'
  | 'deep_fry_converted'
  | 'community_verified';

export type ActionTriggerType =
  | 'shake_basket'
  | 'flip_food'
  | 'flip_and_spray'
  | 'add_topping'
  | 'remove_foil'
  | 'check_doneness';

export type MeasurementUnit = 'g' | 'kg' | 'ml' | 'l' | 'ud' | 'cda' | 'cdta' | 'pizca';

export type NutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export const MEAL_CATEGORY_LABELS: Readonly<Record<MealCategory, string>> = {
  aperitivo: 'Aperitivo',
  principal: 'Plato Principal',
  guarnicion: 'Guarnición',
  reposteria: 'Repostería',
  desayuno: 'Desayuno',
  snack: 'Snack',
};

export const DIET_TAG_LABELS: Readonly<Record<DietTag, string>> = {
  alto_en_proteina: 'Alto en proteína',
  bajo_en_carbohidratos: 'Low-Carb',
  sin_gluten: 'Sin gluten',
  sin_lactosa: 'Sin lactosa',
  sin_huevo: 'Sin huevo',
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  keto: 'Keto',
};

