import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { AirFryerHardwareProfile } from '../models/air-fryer-profile.model';
import { CachedRecipeTipsBundle } from '../models/community-tip.model';
import { RecipePersonalFork } from '../models/personal-fork.model';
import { RecipeShardPayload } from '../models/recipe-detail.model';
import { CatalogIndexManifest } from '../models/recipe-index.model';

interface CrispCraftDbSchema extends DBSchema {
  meta: {
    key: string;
    value: string;
  };
  catalog_index: {
    key: string;
    value: CatalogIndexManifest;
  };
  recipe_shards: {
    key: string;
    value: RecipeShardPayload;
  };
  hardware_profile: {
    key: string;
    value: AirFryerHardwareProfile;
  };
  personal_forks: {
    key: string;
    value: RecipePersonalFork;
  };
  community_tips_cache: {
    key: string;
    value: CachedRecipeTipsBundle;
  };
}

const DB_NAME = 'crisp-craft-db';
const DB_VERSION = 1;

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private readonly dbPromise: Promise<IDBPDatabase<CrispCraftDbSchema>> | null =
    typeof indexedDB !== 'undefined'
      ? openDB<CrispCraftDbSchema>(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('meta')) {
              db.createObjectStore('meta');
            }
            if (!db.objectStoreNames.contains('catalog_index')) {
              db.createObjectStore('catalog_index');
            }
            if (!db.objectStoreNames.contains('recipe_shards')) {
              db.createObjectStore('recipe_shards', { keyPath: 'shardId' });
            }
            if (!db.objectStoreNames.contains('hardware_profile')) {
              db.createObjectStore('hardware_profile');
            }
            if (!db.objectStoreNames.contains('personal_forks')) {
              db.createObjectStore('personal_forks', { keyPath: 'recipeId' });
            }
            if (!db.objectStoreNames.contains('community_tips_cache')) {
              db.createObjectStore('community_tips_cache', { keyPath: 'recipeId' });
            }
          },
        })
      : null;

  async getCatalogManifest(): Promise<CatalogIndexManifest | undefined> {
    if (!this.dbPromise) return undefined;
    const db = await this.dbPromise;
    return db.get('catalog_index', 'master');
  }

  async saveCatalogManifest(manifest: CatalogIndexManifest): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    const prevVersion = await db.get('meta', 'catalog_version');
    if (prevVersion && prevVersion !== manifest.version) {
      await db.clear('recipe_shards');
    }
    await db.put('meta', manifest.version, 'catalog_version');
    await db.put('catalog_index', manifest, 'master');
  }

  async getRecipeShard(shardId: string): Promise<RecipeShardPayload | undefined> {
    if (!this.dbPromise) return undefined;
    const db = await this.dbPromise;
    return db.get('recipe_shards', shardId);
  }

  async saveRecipeShard(shard: RecipeShardPayload): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.put('recipe_shards', shard);
  }

  async getHardwareProfile(): Promise<AirFryerHardwareProfile | undefined> {
    if (!this.dbPromise) return undefined;
    const db = await this.dbPromise;
    return db.get('hardware_profile', 'active_profile');
  }

  async saveHardwareProfile(profile: AirFryerHardwareProfile): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.put('hardware_profile', profile, 'active_profile');
  }

  async getAllPersonalForks(): Promise<readonly RecipePersonalFork[]> {
    if (!this.dbPromise) return [];
    const db = await this.dbPromise;
    return db.getAll('personal_forks');
  }

  async savePersonalFork(fork: RecipePersonalFork): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.put('personal_forks', fork);
  }

  async deletePersonalFork(recipeId: string): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.delete('personal_forks', recipeId);
  }

  async getCachedTipsBundle(recipeId: string): Promise<CachedRecipeTipsBundle | undefined> {
    if (!this.dbPromise) return undefined;
    const db = await this.dbPromise;
    return db.get('community_tips_cache', recipeId);
  }

  async saveCachedTipsBundle(bundle: CachedRecipeTipsBundle): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.put('community_tips_cache', bundle);
  }

  async getMetaValue(key: string): Promise<string | undefined> {
    if (!this.dbPromise) return undefined;
    const db = await this.dbPromise;
    return db.get('meta', key);
  }

  async setMetaValue(key: string, value: string): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.put('meta', value, key);
  }
}

