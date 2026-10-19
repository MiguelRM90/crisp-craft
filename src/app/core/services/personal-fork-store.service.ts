import { Injectable, computed, inject, signal } from '@angular/core';
import { RecipePersonalFork } from '../models/personal-fork.model';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class PersonalForkStoreService {
  private readonly idb = inject(IndexedDbService);
  private readonly forksByIdSignal = signal<Readonly<Record<string, RecipePersonalFork>>>({});

  readonly forksById = this.forksByIdSignal.asReadonly();

  readonly favoriteIds = computed<ReadonlySet<string>>(() => {
    const map = this.forksByIdSignal();
    const favs = new Set<string>();
    for (const [id, fork] of Object.entries(map)) {
      if (fork.isFavorite) {
        favs.add(id);
      }
    }
    return favs;
  });

  readonly favoriteCount = computed<number>(() => this.favoriteIds().size);

  constructor() {
    void this.hydrateFromIndexedDb();
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    const list = await this.idb.getAllPersonalForks();
    const record: Record<string, RecipePersonalFork> = {};
    for (const item of list) {
      record[item.recipeId] = item;
    }
    this.forksByIdSignal.set(record);
  }

  getFork(recipeId: string): RecipePersonalFork | null {
    return this.forksByIdSignal()[recipeId] ?? null;
  }

  isFavorite(recipeId: string): boolean {
    return Boolean(this.forksByIdSignal()[recipeId]?.isFavorite);
  }

  async toggleFavorite(recipeId: string): Promise<void> {
    const existing = this.getFork(recipeId);
    const updated: RecipePersonalFork = existing
      ? {
          ...existing,
          isFavorite: !existing.isFavorite,
          updatedAtIso: new Date().toISOString(),
        }
      : {
          recipeId,
          isFavorite: true,
          personalNotes: '',
          stepNotes: {},
          timesCooked: 0,
          updatedAtIso: new Date().toISOString(),
        };

    await this.saveFork(updated);
  }

  async saveFork(fork: RecipePersonalFork): Promise<void> {
    const nextFork: RecipePersonalFork = {
      ...fork,
      updatedAtIso: new Date().toISOString(),
    };
    this.forksByIdSignal.update((prev) => ({
      ...prev,
      [nextFork.recipeId]: nextFork,
    }));
    await this.idb.savePersonalFork(nextFork);
  }

  async clearForkOverrides(recipeId: string): Promise<void> {
    const existing = this.getFork(recipeId);
    if (!existing) return;

    if (!existing.isFavorite && !existing.personalNotes.trim()) {
      this.forksByIdSignal.update((prev) => {
        const clone = { ...prev };
        delete clone[recipeId];
        return clone;
      });
      await this.idb.deletePersonalFork(recipeId);
      return;
    }

    const cleaned: RecipePersonalFork = {
      recipeId: existing.recipeId,
      isFavorite: existing.isFavorite,
      personalNotes: existing.personalNotes,
      stepNotes: existing.stepNotes,
      personalRating: existing.personalRating,
      timesCooked: existing.timesCooked,
      lastCookedAtIso: existing.lastCookedAtIso,
      updatedAtIso: new Date().toISOString(),
    };
    await this.saveFork(cleaned);
  }

  exportBackupJson(): string {
    return JSON.stringify(Object.values(this.forksByIdSignal()), null, 2);
  }

  async importBackupJson(jsonPayload: string): Promise<number> {
    const parsed: unknown = JSON.parse(jsonPayload);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid Personal Forks backup format');
    }
    let count = 0;
    for (const item of parsed) {
      if (item && typeof item === 'object' && 'recipeId' in item && typeof item.recipeId === 'string') {
        await this.saveFork(item as RecipePersonalFork);
        count++;
      }
    }
    return count;
  }
}

