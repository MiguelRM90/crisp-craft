import type { RecipeDetail } from '../../../src/app/core/models/recipe-detail.model.ts';

export const PESCADOS_Y_MARISCOS_RECIPES: readonly Omit<RecipeDetail, 'shardId'>[] = [
  {
    id: 'es_af_00003',
    slug: 'salmon-glaseado-soja-miel-limon',
    title: 'Lomos de Salmón Jugosos con Glaseado de Soja y Miel',
    lang: 'es-ES',
    originRegion: 'ES',
    sourceMeta: {
      adaptationType: 'native_air_fryer',
      license: 'Factual-TRLPI-Art10',
      canonicalRef: 'crisp-craft/es/pescados/salmon-glaseado-af',
    },
    searchIndex: {
      prepMin: 8,
      cookMin: 9,
      totalMin: 17,
      difficulty: 1,
      servings: 2,
      mealCategory: 'principal',
      dietTags: ['alto_en_proteina', 'bajo_en_carbohidratos', 'sin_lactosa', 'sin_huevo'],
      mainIngIds: ['salmon_lomo', 'salsa_soja', 'miel', 'limon'],
      ingCount: 4,
      stepCount: 3,
    },
    afProfile: {
      baseTempC: 195,
      baseTempF: 385,
      preheatMin: 3,
      singleLayerRequired: true,
      oilSprayRequired: false,
      foodPhysicsClass: 'fatty_protein',
      referenceLoadG: 400,
      hardwareMultipliers: {
        compact1000w3l: 1.12,
        standard1500w5l: 1.0,
        highPower2000w6l: 0.88,
      },
      massScalingCurve: [
        { loadG: 200, timeFactor: 0.88 },
        { loadG: 400, timeFactor: 1.0 },
        { loadG: 650, timeFactor: 1.15, batchWarning: true },
      ],
      actionTriggers: [
        {
          type: 'add_topping',
          pctTrigger: 0.67,
          defaultMin: 6,
          label: 'Pincelar la superficie del salmón con el glaseado de miel y soja para caramelizar sin quemar.',
        },
      ],
    },
    ingredientGroups: [
      {
        purpose: 'Pescado y glaseado',
        items: [
          { id: 'salmon_lomo', name: 'Lomos de salmón fresco con piel (3 cm de grosor)', qty: 400, unit: 'g' },
          { id: 'salsa_soja', name: 'Salsa de soja baja en sal', qty: 20, unit: 'ml' },
          { id: 'miel', name: 'Miel suave', qty: 15, unit: 'g' },
          { id: 'limon', name: 'Zumo de limón fresco', qty: 10, unit: 'ml' },
        ],
      },
    ],
    steps: [
      {
        step: 1,
        text: 'Emulsionar en un cuenco la salsa de soja, la miel y el zumo de limón. Secar los lomos de salmón con papel de cocina.',
      },
      {
        step: 2,
        text: 'Colocar el salmón con la piel hacia abajo en la cesta precalentada a 195 °C y cocinar durante 6 minutos sin voltear.',
        timerSec: 360,
        isAirFryerActivePhase: true,
      },
      {
        step: 3,
        text: 'Pincelar generosamente con el glaseado de miel y soja y cocinar los 3 minutos finales a 195 °C hasta que el exterior brille y el centro quede jugoso.',
        timerSec: 180,
        isAirFryerActivePhase: true,
      },
    ],
    nutritionPerServing: {
      kcal: 410,
      proteinG: 41.2,
      fatG: 23.8,
      carbsG: 7.5,
      nutriscoreEst: 'A',
      dataSource: 'BEDCA_ES',
    },
  },
  {
    id: 'es_af_00010',
    slug: 'langostinos-ajillo-limon-express',
    title: 'Langostinos al Ajillo y Limón en Freidora de Aire',
    lang: 'es-ES',
    originRegion: 'ES',
    sourceMeta: {
      adaptationType: 'native_air_fryer',
      license: 'Factual-TRLPI-Art10',
      canonicalRef: 'crisp-craft/es/pescados/langostinos-ajillo-af',
    },
    searchIndex: {
      prepMin: 6,
      cookMin: 7,
      totalMin: 13,
      difficulty: 1,
      servings: 2,
      mealCategory: 'aperitivo',
      dietTags: ['alto_en_proteina', 'bajo_en_carbohidratos', 'keto', 'sin_gluten', 'sin_lactosa', 'sin_huevo'],
      mainIngIds: ['langostinos', 'aceite_oliva', 'ajo_polvo', 'pimenton_dulce', 'limon'],
      ingCount: 5,
      stepCount: 2,
    },
    afProfile: {
      baseTempC: 195,
      baseTempF: 385,
      preheatMin: 3,
      singleLayerRequired: true,
      oilSprayRequired: true,
      foodPhysicsClass: 'lean_protein',
      referenceLoadG: 350,
      hardwareMultipliers: {
        compact1000w3l: 1.1,
        standard1500w5l: 1.0,
        highPower2000w6l: 0.85,
      },
      massScalingCurve: [
        { loadG: 200, timeFactor: 0.85 },
        { loadG: 350, timeFactor: 1.0 },
        { loadG: 600, timeFactor: 1.2, batchWarning: true },
      ],
      actionTriggers: [
        {
          type: 'shake_basket',
          pctTrigger: 0.57,
          defaultMin: 4,
          label: 'Agitar la cesta a los 4 minutos para que los langostinos se cocinen por igual sin secarse.',
        },
      ],
    },
    ingredientGroups: [
      {
        purpose: 'Marisco y aliño al ajillo',
        items: [
          { id: 'langostinos', name: 'Langostinos crudos pelados', qty: 350, unit: 'g' },
          { id: 'aceite_oliva', name: 'Aceite de oliva virgen extra', qty: 15, unit: 'ml' },
          { id: 'ajo_polvo', name: 'Ajo laminado fino y perejil', qty: 5, unit: 'g' },
          { id: 'pimenton_dulce', name: 'Pimentón dulce de la Vera y guindilla opcional', qty: 2, unit: 'g' },
          { id: 'limon', name: 'Zumo de limón recién exprimido', qty: 10, unit: 'ml' },
        ],
      },
    ],
    steps: [
      {
        step: 1,
        text: 'Secar los langostinos pelados con papel absorbente y mezclarlos en un cuenco con el aceite de oliva virgen extra, el ajo y el pimentón.',
      },
      {
        step: 2,
        text: 'Cocinar en la cesta precalentada a 195 °C durante 7 minutos exactos, agitando en el minuto 4. Regar con zumo de limón al servir.',
        timerSec: 420,
        isAirFryerActivePhase: true,
      },
    ],
    nutritionPerServing: {
      kcal: 220,
      proteinG: 32.5,
      fatG: 8.8,
      carbsG: 1.5,
      nutriscoreEst: 'A',
      dataSource: 'BEDCA_ES',
    },
  },
];
