import type { RecipeDetail } from '../../../src/app/core/models/recipe-detail.model.ts';

export const APERITIVOS_Y_SNACKS_RECIPES: readonly Omit<RecipeDetail, 'shardId'>[] = [
  {
    id: 'es_af_00006',
    slug: 'croquetas-jamon-iberico-freidora-aire',
    title: 'Croquetas Caseras de Jamón Ibérico Doradas sin Freír',
    lang: 'es-ES',
    originRegion: 'ES',
    sourceMeta: {
      adaptationType: 'native_air_fryer',
      license: 'Factual-TRLPI-Art10',
      canonicalRef: 'crisp-craft/es/aperitivos/croquetas-jamon-af',
    },
    searchIndex: {
      prepMin: 5,
      cookMin: 12,
      totalMin: 17,
      difficulty: 1,
      servings: 3,
      mealCategory: 'aperitivo',
      dietTags: [],
      mainIngIds: ['jamon_iberico', 'leche_entera', 'pan_rallado', 'huevo', 'aceite_oliva'],
      ingCount: 5,
      stepCount: 3,
    },
    afProfile: {
      baseTempC: 200,
      baseTempF: 390,
      preheatMin: 4,
      singleLayerRequired: true,
      oilSprayRequired: true,
      foodPhysicsClass: 'battered_or_breaded',
      referenceLoadG: 360,
      hardwareMultipliers: {
        compact1000w3l: 1.12,
        standard1500w5l: 1.0,
        highPower2000w6l: 0.9,
      },
      massScalingCurve: [
        { loadG: 200, timeFactor: 0.88 },
        { loadG: 360, timeFactor: 1.0 },
        { loadG: 650, timeFactor: 1.22, batchWarning: true },
      ],
      actionTriggers: [
        {
          type: 'flip_and_spray',
          pctTrigger: 0.58,
          defaultMin: 7,
          label: 'Girar suavemente las croquetas y aplicar una nebulización ligera de aceite de oliva para dorar la base.',
        },
      ],
    },
    ingredientGroups: [
      {
        purpose: 'Croquetas reposadas y pulverizado',
        items: [
          { id: 'jamon_iberico', name: 'Croquetas caseras de jamón ibérico (refrigeradas o congeladas)', qty: 360, unit: 'g' },
          { id: 'pan_rallado', name: 'Rebozado en pan rallado ligeramente tostado', qty: 40, unit: 'g' },
          { id: 'huevo', name: 'Huevo batido del empanado', qty: 1, unit: 'ud' },
          { id: 'leche_entera', name: 'Base de bechamel cremosa de leche entera', qty: 200, unit: 'ml' },
          { id: 'aceite_oliva', name: 'Aceite de oliva virgen extra en spray', qty: 12, unit: 'ml' },
        ],
      },
    ],
    steps: [
      {
        step: 1,
        text: 'Dejar reposar las croquetas empanadas 20 minutos en nevera (o usarlas directamente congeladas sumando 2 minutos) para que la bechamel mantenga su forma sin abrirse.',
      },
      {
        step: 2,
        text: 'Pulverizar toda la superficie de las croquetas con aceite de oliva en spray y colocarlas separadas en la cesta precalentada a 200 °C durante 7 minutos.',
        timerSec: 420,
        isAirFryerActivePhase: true,
      },
      {
        step: 3,
        text: 'Voltear con cuidado, aplicar un segundo toque de spray y cocinar los 5 minutos finales a 200 °C hasta lograr una corteza crujiente y uniforme.',
        timerSec: 300,
        isAirFryerActivePhase: true,
      },
    ],
    nutritionPerServing: {
      kcal: 265,
      proteinG: 12.8,
      fatG: 11.4,
      carbsG: 27.5,
      nutriscoreEst: 'B',
      dataSource: 'BEDCA_ES',
    },
  },
  {
    id: 'es_af_00007',
    slug: 'garbanzos-especiados-snack-crujiente',
    title: 'Snack de Garbanzos Tostados al Pimentón de la Vera y Limón',
    lang: 'es-ES',
    originRegion: 'ES',
    sourceMeta: {
      adaptationType: 'native_air_fryer',
      license: 'Factual-TRLPI-Art10',
      canonicalRef: 'crisp-craft/es/aperitivos/garbanzos-crujientes-af',
    },
    searchIndex: {
      prepMin: 5,
      cookMin: 14,
      totalMin: 19,
      difficulty: 1,
      servings: 4,
      mealCategory: 'snack',
      dietTags: ['vegano', 'vegetariano', 'alto_en_proteina', 'sin_gluten', 'sin_lactosa', 'sin_huevo'],
      mainIngIds: ['garbanzos_cocidos', 'pimenton_dulce', 'ajo_polvo', 'aceite_oliva', 'limon'],
      ingCount: 5,
      stepCount: 3,
    },
    afProfile: {
      baseTempC: 195,
      baseTempF: 385,
      preheatMin: 3,
      singleLayerRequired: false,
      oilSprayRequired: true,
      foodPhysicsClass: 'tender_vegetables',
      referenceLoadG: 400,
      hardwareMultipliers: {
        compact1000w3l: 1.15,
        standard1500w5l: 1.0,
        highPower2000w6l: 0.9,
      },
      massScalingCurve: [
        { loadG: 200, timeFactor: 0.8 },
        { loadG: 400, timeFactor: 1.0 },
        { loadG: 700, timeFactor: 1.25, batchWarning: true },
      ],
      actionTriggers: [
        {
          type: 'shake_basket',
          pctTrigger: 0.5,
          defaultMin: 7,
          label: 'Agitar la cesta para que los garbanzos rueden y se tuesten de forma homogénea.',
        },
      ],
    },
    ingredientGroups: [
      {
        purpose: 'Garbanzos y aliño post-tostado',
        items: [
          { id: 'garbanzos_cocidos', name: 'Garbanzos cocidos escurridos y secos', qty: 400, unit: 'g' },
          { id: 'aceite_oliva', name: 'Aceite de oliva virgen extra', qty: 10, unit: 'ml' },
          { id: 'pimenton_dulce', name: 'Pimentón dulce de la Vera', qty: 4, unit: 'g' },
          { id: 'ajo_polvo', name: 'Ajo en polvo y comino', qty: 4, unit: 'g' },
          { id: 'limon', name: 'Ralladura de limón', qty: 3, unit: 'g' },
        ],
      },
    ],
    steps: [
      {
        step: 1,
        text: 'Enjuagar los garbanzos, escurrirlos y secarlos muy bien con papel de cocina. Rociar únicamente con el aceite y sal (añadir las especias al final evita que amarguen).',
      },
      {
        step: 2,
        text: 'Cocinar a 195 °C durante 14 minutos, agitando la cesta en el minuto 7 hasta que estén suflados y crujientes.',
        timerSec: 840,
        isAirFryerActivePhase: true,
      },
      {
        step: 3,
        text: 'En caliente, espolvorear el pimentón de la Vera, el ajo en polvo y la ralladura de limón para que se adhieran al aceite residual.',
      },
    ],
    nutritionPerServing: {
      kcal: 165,
      proteinG: 8.8,
      fatG: 4.5,
      carbsG: 22.4,
      fiberG: 6.8,
      nutriscoreEst: 'A',
      dataSource: 'BEDCA_ES',
    },
  },
];
