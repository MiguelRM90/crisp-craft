import type { RecipeDetail } from '../../../src/app/core/models/recipe-detail.model.ts';

export const REPOSTERIA_Y_DULCES_RECIPES: readonly Omit<RecipeDetail, 'shardId'>[] = [
  {
    id: 'es_af_00005',
    slug: 'tarta-queso-vasca-cremosa-freidora-aire',
    title: 'Tarta de Queso Vasca Cremosa (Estilo La Viña) en Molde',
    lang: 'es-ES',
    originRegion: 'ES',
    sourceMeta: {
      adaptationType: 'native_air_fryer',
      license: 'Factual-TRLPI-Art10',
      canonicalRef: 'crisp-craft/es/reposteria/tarta-queso-vasca-af',
    },
    searchIndex: {
      prepMin: 10,
      cookMin: 22,
      totalMin: 32,
      difficulty: 2,
      servings: 6,
      mealCategory: 'reposteria',
      dietTags: ['vegetariano', 'sin_gluten'],
      mainIngIds: ['queso_crema', 'huevo', 'harina_almendra', 'miel'],
      ingCount: 4,
      stepCount: 3,
    },
    afProfile: {
      baseTempC: 175,
      baseTempF: 345,
      preheatMin: 4,
      singleLayerRequired: true,
      oilSprayRequired: false,
      foodPhysicsClass: 'bakery_pastry_dough',
      referenceLoadG: 650,
      hardwareMultipliers: {
        compact1000w3l: 1.12,
        standard1500w5l: 1.0,
        highPower2000w6l: 0.92,
      },
      massScalingCurve: [
        { loadG: 400, timeFactor: 0.85 },
        { loadG: 650, timeFactor: 1.0 },
        { loadG: 900, timeFactor: 1.18 },
      ],
      actionTriggers: [
        {
          type: 'check_doneness',
          pctTrigger: 0.82,
          defaultMin: 18,
          label: 'Comprobar que el centro tiemble como un flan y la superficie esté tostada.',
        },
      ],
    },
    ingredientGroups: [
      {
        purpose: 'Crema de queso',
        items: [
          { id: 'queso_crema', name: 'Queso crema a temperatura ambiente', qty: 400, unit: 'g' },
          { id: 'huevo', name: 'Huevos camperos talla L', qty: 3, unit: 'ud' },
          { id: 'harina_almendra', name: 'Harina fina de almendra o almidón de maíz', qty: 15, unit: 'g' },
          { id: 'miel', name: 'Azúcar blanquilla o miel suave', qty: 90, unit: 'g' },
        ],
      },
    ],
    steps: [
      {
        step: 1,
        text: 'Batir con varillas manuales el queso crema con el endulzante, incorporar los huevos uno a uno sin meter aire en exceso y añadir la harina tamizada.',
      },
      {
        step: 2,
        text: 'Volcar la mezcla en un molde de 15–18 cm forrado con papel de horno humedecido y arrugado. Cocinar a 175 °C durante 22 minutos.',
        timerSec: 1320,
        isAirFryerActivePhase: true,
      },
      {
        step: 3,
        text: 'Retirar con el centro aún tembloroso y dejar atemperar mínimo 2 horas antes de desmoldar para que asiente la textura cremosa.',
      },
    ],
    nutritionPerServing: {
      kcal: 295,
      proteinG: 8.4,
      fatG: 22.1,
      carbsG: 15.6,
      nutriscoreEst: 'C',
      dataSource: 'BEDCA_ES',
    },
  },
  {
    id: 'es_af_00012',
    slug: 'manzanas-asadas-canela-avena-crujiente',
    title: 'Manzanas Asadas Rellenas de Avena, Almendra y Canela',
    lang: 'es-ES',
    originRegion: 'ES',
    sourceMeta: {
      adaptationType: 'native_air_fryer',
      license: 'Factual-TRLPI-Art10',
      canonicalRef: 'crisp-craft/es/reposteria/manzanas-asadas-af',
    },
    searchIndex: {
      prepMin: 8,
      cookMin: 16,
      totalMin: 24,
      difficulty: 1,
      servings: 2,
      mealCategory: 'reposteria',
      dietTags: ['vegetariano', 'sin_lactosa', 'sin_huevo'],
      mainIngIds: ['manzana', 'avena_copos', 'harina_almendra', 'miel'],
      ingCount: 4,
      stepCount: 2,
    },
    afProfile: {
      baseTempC: 175,
      baseTempF: 345,
      preheatMin: 3,
      singleLayerRequired: true,
      oilSprayRequired: false,
      foodPhysicsClass: 'bakery_pastry_dough',
      referenceLoadG: 420,
      hardwareMultipliers: {
        compact1000w3l: 1.12,
        standard1500w5l: 1.0,
        highPower2000w6l: 0.9,
      },
      massScalingCurve: [
        { loadG: 210, timeFactor: 0.88 },
        { loadG: 420, timeFactor: 1.0 },
        { loadG: 800, timeFactor: 1.2, batchWarning: true },
      ],
      actionTriggers: [
        {
          type: 'check_doneness',
          pctTrigger: 0.75,
          defaultMin: 12,
          label: 'Comprobar el dorado de la cobertura de avena; cubrir con papel de aluminio si tuesta muy rápido.',
        },
      ],
    },
    ingredientGroups: [
      {
        purpose: 'Fruta y relleno crujiente',
        items: [
          { id: 'manzana', name: 'Manzanas Reineta descorazonadas', qty: 2, unit: 'ud' },
          { id: 'avena_copos', name: 'Copos de avena suaves', qty: 30, unit: 'g' },
          { id: 'harina_almendra', name: 'Almendra picada o harina de almendra', qty: 20, unit: 'g' },
          { id: 'miel', name: 'Miel y canela en polvo', qty: 15, unit: 'g' },
        ],
      },
    ],
    steps: [
      {
        step: 1,
        text: 'Descorazonar las manzanas reineta sin perforar la base y rellenar el hueco central con la mezcla de copos de avena, almendra, miel y canela.',
      },
      {
        step: 2,
        text: 'Asar en la freidora de aire a 175 °C durante 16 minutos hasta que la pulpa esté tierna al pincharla y la avena crujiente.',
        timerSec: 960,
        isAirFryerActivePhase: true,
      },
    ],
    nutritionPerServing: {
      kcal: 245,
      proteinG: 4.8,
      fatG: 6.4,
      carbsG: 44.2,
      fiberG: 6.1,
      nutriscoreEst: 'A',
      dataSource: 'BEDCA_ES',
    },
  },
];

