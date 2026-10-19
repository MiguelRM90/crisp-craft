import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeDetail, RecipeShardPayload } from '../models/recipe-detail.model';
import { CatalogIndexManifest, RecipeIndexItem } from '../models/recipe-index.model';
import { DietTag, MealCategory } from '../models/recipe-taxonomy.model';
import { IndexedDbService } from './indexed-db.service';
import { PersonalForkStoreService } from './personal-fork-store.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogStoreService {
  private readonly http = inject(HttpClient);
  private readonly idb = inject(IndexedDbService);
  private readonly forkStore = inject(PersonalForkStoreService);

  private readonly manifestSignal = signal<CatalogIndexManifest | null>(null);
  private readonly loadedRecipesSignal = signal<Readonly<Record<string, RecipeDetail>>>({});
  private readonly loadingSignal = signal<boolean>(true);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<MealCategory | 'all'>('all');
  readonly selectedDietTags = signal<readonly DietTag[]>([]);
  readonly selectedIngredientIds = signal<readonly string[]>([]);
  readonly maxTotalMinutes = signal<number | null>(null);
  readonly onlyFavorites = signal<boolean>(false);

  readonly manifest = this.manifestSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  readonly invertedIngredientIndex = computed<ReadonlyMap<string, ReadonlySet<string>>>(() => {
    const manifest = this.manifestSignal();
    const map = new Map<string, Set<string>>();
    if (!manifest) return map;

    for (const item of manifest.items) {
      for (const ingId of item.searchIndex.mainIngIds) {
        let set = map.get(ingId);
        if (!set) {
          set = new Set<string>();
          map.set(ingId, set);
        }
        set.add(item.id);
      }
    }
    return map;
  });

  readonly availableIngredients = computed<
    readonly { readonly id: string; readonly label: string; readonly count: number }[]
  >(() => {
    const manifest = this.manifestSignal();
    const index = this.invertedIngredientIndex();
    if (!manifest) return [];

    return Object.entries(manifest.canonicalIngredients)
      .map(([id, label]) => ({
        id,
        label,
        count: index.get(id)?.size ?? 0,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  });

  readonly filteredRecipes = computed<readonly RecipeIndexItem[]>(() => {
    const manifest = this.manifestSignal();
    if (!manifest) return [];

    const query = this.normalizeText(this.searchQuery());
    const category = this.selectedCategory();
    const diets = this.selectedDietTags();
    const pantryIngIds = this.selectedIngredientIds();
    const maxMin = this.maxTotalMinutes();
    const onlyFavs = this.onlyFavorites();
    const favSet = this.forkStore.favoriteIds();
    const ingIndex = this.invertedIngredientIndex();

    let candidateIds: ReadonlySet<string> | null = null;
    if (pantryIngIds.length > 0) {
      for (const ingId of pantryIngIds) {
        const matchingSet = ingIndex.get(ingId) ?? new Set<string>();
        if (candidateIds === null) {
          candidateIds = new Set(matchingSet);
        } else {
          const intersection = new Set<string>();
          for (const id of candidateIds) {
            if (matchingSet.has(id)) {
              intersection.add(id);
            }
          }
          candidateIds = intersection;
        }
      }
    }

    const queryMatchedIngIds = query ? this.resolveIngredientIdsBySynonymQuery(query, manifest) : [];

    return manifest.items.filter((item) => {
      if (candidateIds !== null && !candidateIds.has(item.id)) {
        return false;
      }
      if (onlyFavs && !favSet.has(item.id)) {
        return false;
      }
      if (category !== 'all' && item.searchIndex.mealCategory !== category) {
        return false;
      }
      if (maxMin !== null && item.searchIndex.totalMin > maxMin) {
        return false;
      }
      if (diets.length > 0) {
        const hasAllDiets = diets.every((tag) => item.searchIndex.dietTags.includes(tag));
        if (!hasAllDiets) return false;
      }
      if (query) {
        const titleMatch = this.normalizeText(item.title).includes(query);
        const ingDirectMatch = item.searchIndex.mainIngIds.some(
          (id) =>
            this.normalizeText(manifest.canonicalIngredients[id] ?? id).includes(query) ||
            queryMatchedIngIds.includes(id)
        );
        if (!titleMatch && !ingDirectMatch) {
          return false;
        }
      }
      return true;
    });
  });

  constructor() {
    void this.initializeCatalog();
  }

  private async initializeCatalog(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const cached = await this.idb.getCatalogManifest();
      if (cached && cached.items.length > 0) {
        this.manifestSignal.set(cached);
        this.loadingSignal.set(false);
      }

      const remote = await firstValueFrom(
        this.http.get<CatalogIndexManifest>('data/catalog-index.v1.json')
      );
      this.manifestSignal.set(remote);
      await this.idb.saveCatalogManifest(remote);
    } catch {
      // Offline fallback uses IndexedDB manifest if already hydrated
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadRecipeBySlugOrId(slugOrId: string): Promise<RecipeDetail | null> {
    const manifest = this.manifestSignal() ?? (await this.waitForManifest());
    if (!manifest) return null;

    const indexEntry = manifest.items.find(
      (item) => item.slug === slugOrId || item.id === slugOrId
    );
    if (!indexEntry) return null;

    const inMemory = this.loadedRecipesSignal()[indexEntry.id];
    if (inMemory) return inMemory;

    const cachedShard = await this.idb.getRecipeShard(indexEntry.shardId);
    if (cachedShard && cachedShard.recipes[indexEntry.id]) {
      this.loadedRecipesSignal.update((prev) => ({
        ...prev,
        ...cachedShard.recipes,
      }));
      return cachedShard.recipes[indexEntry.id];
    }

    const remoteShard = await firstValueFrom(
      this.http.get<RecipeShardPayload>(`data/shards/recipes-${indexEntry.shardId}.json`)
    );
    await this.idb.saveRecipeShard(remoteShard);
    this.loadedRecipesSignal.update((prev) => ({
      ...prev,
      ...remoteShard.recipes,
    }));

    return remoteShard.recipes[indexEntry.id] ?? null;
  }

  toggleIngredientFilter(ingId: string): void {
    this.selectedIngredientIds.update((current) =>
      current.includes(ingId) ? current.filter((id) => id !== ingId) : [...current, ingId]
    );
  }

  toggleDietTagFilter(tag: DietTag): void {
    this.selectedDietTags.update((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.selectedDietTags.set([]);
    this.selectedIngredientIds.set([]);
    this.maxTotalMinutes.set(null);
    this.onlyFavorites.set(false);
  }

  private async waitForManifest(): Promise<CatalogIndexManifest | null> {
    const remote = await firstValueFrom(
      this.http.get<CatalogIndexManifest>('data/catalog-index.v1.json')
    );
    this.manifestSignal.set(remote);
    await this.idb.saveCatalogManifest(remote);
    return remote;
  }

  private resolveIngredientIdsBySynonymQuery(
    normalizedQuery: string,
    manifest: CatalogIndexManifest
  ): readonly string[] {
    const matchedIds: string[] = [];
    for (const [ingId, synonyms] of Object.entries(manifest.ingredientSynonyms)) {
      if (synonyms.some((syn) => this.normalizeText(syn).includes(normalizedQuery))) {
        matchedIds.push(ingId);
      }
    }
    return matchedIds;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}

