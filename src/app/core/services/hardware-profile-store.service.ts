import { Injectable, inject, signal } from '@angular/core';
import {
  AirFryerHardwareProfile,
  BasketAccessoryType,
  BasketCapacityTier,
  DEFAULT_HARDWARE_PROFILE,
} from '../models/air-fryer-profile.model';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class HardwareProfileStoreService {
  private readonly idb = inject(IndexedDbService);
  private readonly profileSignal = signal<AirFryerHardwareProfile>(DEFAULT_HARDWARE_PROFILE);

  readonly profile = this.profileSignal.asReadonly();

  constructor() {
    void this.hydrateFromIndexedDb();
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    const saved = await this.idb.getHardwareProfile();
    if (saved) {
      this.profileSignal.set(saved);
    }
  }

  async updateProfile(patch: Partial<AirFryerHardwareProfile>): Promise<void> {
    const next: AirFryerHardwareProfile = {
      ...this.profileSignal(),
      ...patch,
      updatedAtIso: new Date().toISOString(),
    };
    this.profileSignal.set(next);
    await this.idb.saveHardwareProfile(next);
  }

  async setBasketCapacity(basketCapacity: BasketCapacityTier): Promise<void> {
    const nominalPowerWatts =
      basketCapacity === 'compact_under_4l'
        ? 1200
        : basketCapacity === 'large_over_6l'
          ? 2000
          : 1500;
    await this.updateProfile({ basketCapacity, nominalPowerWatts });
  }

  async setDefaultAccessory(defaultAccessory: BasketAccessoryType): Promise<void> {
    await this.updateProfile({ defaultAccessory });
  }

  async toggleDualHeatingElement(): Promise<void> {
    await this.updateProfile({
      hasDualHeatingElement: !this.profileSignal().hasDualHeatingElement,
    });
  }

  async toggleDualBasketSharedPower(): Promise<void> {
    await this.updateProfile({
      isDualBasketSharedPower: !this.profileSignal().isDualBasketSharedPower,
    });
  }
}

