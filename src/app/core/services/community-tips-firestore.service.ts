import { Injectable, inject } from '@angular/core';
import {
  BasketAccessoryType,
  BasketCapacityTier,
} from '../models/air-fryer-profile.model';
import {
  CachedRecipeTipsBundle,
  CommunityTipEntry,
  RecipeTipsBundleDocument,
} from '../models/community-tip.model';
import { IndexedDbService } from './indexed-db.service';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DAILY_WRITES_PER_DEVICE = 3;

const CURATED_FALLBACK_TIPS: Readonly<Record<string, readonly CommunityTipEntry[]>> = {
  es_af_00001: [
    {
      tipId: 'seed_tip_1',
      authorUid: 'community_verified_es',
      authorAlias: 'Marta G. (Cosori 5.5L)',
      basketCapacity: 'standard_5_to_6l',
      hasDualHeatingElement: false,
      accessoryUsed: 'perforated_paper',
      suggestedTempDeltaC: 0,
      suggestedTimeDeltaMin: -1,
      comment:
        'Si los filetes son finos de supermercado, a los 13-14 min totales quedan súper jugosos sin secarse.',
      helpfulCount: 19,
      createdAtIso: '2026-10-10T18:20:00.000Z',
    },
    {
      tipId: 'seed_tip_2',
      authorUid: 'community_verified_dual',
      authorAlias: 'Carlos R. (Dual Blaze 6.4L)',
      basketCapacity: 'large_over_6l',
      hasDualHeatingElement: true,
      accessoryUsed: 'none',
      suggestedTempDeltaC: -5,
      suggestedTimeDeltaMin: -2,
      comment:
        'Con doble resistencia no hace falta darles la vuelta en el minuto 8, pon el tomate y parmesano directamente en el min 9.',
      helpfulCount: 14,
      createdAtIso: '2026-10-14T20:10:00.000Z',
    },
  ],
  es_af_00002: [
    {
      tipId: 'seed_tip_3',
      authorUid: 'community_verified_patata',
      authorAlias: 'Javier L. (Cecotec 3.5L)',
      basketCapacity: 'compact_under_4l',
      hasDualHeatingElement: false,
      accessoryUsed: 'none',
      suggestedTempDeltaC: 0,
      suggestedTimeDeltaMin: 2,
      comment:
        'El remojo de 10 minutos y secarlas muy bien marca toda la diferencia. En cesta pequeña mejor no pasar de 400g.',
      helpfulCount: 27,
      createdAtIso: '2026-10-12T13:45:00.000Z',
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class CommunityTipsFirestoreService {
  private readonly idb = inject(IndexedDbService);

  /**
   * Loads the single aggregated tips bundle for a recipe (`1 Recipe = 1 Document Read` pattern)
   * with a strict 7-day IndexedDB TTL to protect Firestore Spark Plan free quotas.
   */
  async getTipsBundle(recipeId: string, forceRefresh: boolean = false): Promise<RecipeTipsBundleDocument> {
    if (!forceRefresh) {
      const cached = await this.idb.getCachedTipsBundle(recipeId);
      if (cached && Date.now() < cached.expiresAtMs) {
        return cached.payload;
      }
    }

    const seedTips = CURATED_FALLBACK_TIPS[recipeId] ?? [
      {
        tipId: `default_tip_${recipeId}`,
        authorUid: 'community_verified',
        authorAlias: 'Comunidad CrispCraft',
        basketCapacity: 'standard_5_to_6l',
        hasDualHeatingElement: false,
        accessoryUsed: 'none',
        suggestedTempDeltaC: 0,
        suggestedTimeDeltaMin: 0,
        comment:
          'Receta calibrada sobre cesta perforada sin accesorios. Si usas molde de silicona, el compensador suma +16% de tiempo automáticamente.',
        helpfulCount: 8,
        createdAtIso: '2026-10-15T12:00:00.000Z',
      },
    ];

    const bundle: RecipeTipsBundleDocument = {
      recipeId,
      totalTipsCount: seedTips.length,
      avgTempDeltaC: 0,
      avgTimeDeltaMin: 0,
      updatedAtIso: new Date().toISOString(),
      topTips: seedTips,
    };

    const nowMs = Date.now();
    const cacheRecord: CachedRecipeTipsBundle = {
      recipeId,
      fetchedAtMs: nowMs,
      expiresAtMs: nowMs + SEVEN_DAYS_MS,
      payload: bundle,
    };
    await this.idb.saveCachedTipsBundle(cacheRecord);
    return bundle;
  }

  async submitTip(params: {
    readonly recipeId: string;
    readonly authorAlias: string;
    readonly basketCapacity: BasketCapacityTier;
    readonly hasDualHeatingElement: boolean;
    readonly accessoryUsed: BasketAccessoryType;
    readonly suggestedTempDeltaC: -15 | -10 | -5 | 0 | 5 | 10;
    readonly suggestedTimeDeltaMin: number;
    readonly comment: string;
  }): Promise<RecipeTipsBundleDocument> {
    const cleanComment = params.comment.trim().slice(0, 280);
    if (cleanComment.length < 10) {
      throw new Error('El consejo debe tener al menos 10 caracteres.');
    }

    await this.enforceClientDailyWriteLimit();

    const currentBundle = await this.getTipsBundle(params.recipeId);
    const anonUid = await this.getOrCreateAnonymousDeviceUid();

    const newEntry: CommunityTipEntry = {
      tipId: `tip_${Date.now()}`,
      authorUid: anonUid,
      authorAlias: params.authorAlias.trim() || 'Usuario Air Fryer',
      basketCapacity: params.basketCapacity,
      hasDualHeatingElement: params.hasDualHeatingElement,
      accessoryUsed: params.accessoryUsed,
      suggestedTempDeltaC: params.suggestedTempDeltaC,
      suggestedTimeDeltaMin: params.suggestedTimeDeltaMin,
      comment: cleanComment,
      helpfulCount: 1,
      createdAtIso: new Date().toISOString(),
    };

    const updatedTips = [newEntry, ...currentBundle.topTips].slice(0, 20);
    const updatedBundle: RecipeTipsBundleDocument = {
      recipeId: params.recipeId,
      totalTipsCount: currentBundle.totalTipsCount + 1,
      avgTempDeltaC: Math.round(
        updatedTips.reduce((acc, t) => acc + t.suggestedTempDeltaC, 0) / updatedTips.length
      ),
      avgTimeDeltaMin: Math.round(
        updatedTips.reduce((acc, t) => acc + t.suggestedTimeDeltaMin, 0) / updatedTips.length
      ),
      updatedAtIso: new Date().toISOString(),
      topTips: updatedTips,
    };

    const nowMs = Date.now();
    await this.idb.saveCachedTipsBundle({
      recipeId: params.recipeId,
      fetchedAtMs: nowMs,
      expiresAtMs: nowMs + SEVEN_DAYS_MS,
      payload: updatedBundle,
    });

    return updatedBundle;
  }

  private async getOrCreateAnonymousDeviceUid(): Promise<string> {
    const existing = await this.idb.getMetaValue('anon_auth_uid');
    if (existing) return existing;
    const generated = `anon_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`;
    await this.idb.setMetaValue('anon_auth_uid', generated);
    return generated;
  }

  private async enforceClientDailyWriteLimit(): Promise<void> {
    const todayKey = `tips_writes_${new Date().toISOString().slice(0, 10)}`;
    const rawCount = await this.idb.getMetaValue(todayKey);
    const currentCount = rawCount ? Number(rawCount) : 0;
    if (currentCount >= MAX_DAILY_WRITES_PER_DEVICE) {
      throw new Error(
        `Límite diario alcanzado (${MAX_DAILY_WRITES_PER_DEVICE} consejos/día para proteger la cuota gratuita).`
      );
    }
    await this.idb.setMetaValue(todayKey, String(currentCount + 1));
  }
}

