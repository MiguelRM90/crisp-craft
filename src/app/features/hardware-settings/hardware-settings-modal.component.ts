import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PwaModalComponent, PwaNumericSliderComponent } from 'pwa-ui-core/components';
import { PwaToastService } from 'pwa-ui-core/services';
import {
  BASKET_ACCESSORY_LABELS,
  BASKET_CAPACITY_LABELS,
  BasketAccessoryType,
  BasketCapacityTier,
  HardwareProfileStoreService,
  PersonalForkStoreService,
  TemperatureUnit,
} from '../../core';

@Component({
  selector: 'app-hardware-settings-modal',
  standalone: true,
  imports: [FormsModule, PwaModalComponent, PwaNumericSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hardware-settings-modal.component.html',
  styleUrl: './hardware-settings-modal.component.css',
})
export class HardwareSettingsModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly hardwareStore = inject(HardwareProfileStoreService);
  readonly forkStore = inject(PersonalForkStoreService);
  readonly toast = inject(PwaToastService);

  readonly capacityEntries: readonly { readonly key: BasketCapacityTier; readonly label: string }[] = [
    { key: 'compact_under_4l', label: BASKET_CAPACITY_LABELS.compact_under_4l },
    { key: 'standard_5_to_6l', label: BASKET_CAPACITY_LABELS.standard_5_to_6l },
    { key: 'large_over_6l', label: BASKET_CAPACITY_LABELS.large_over_6l },
  ];

  readonly accessoryEntries: readonly { readonly key: BasketAccessoryType; readonly label: string }[] = [
    { key: 'none', label: BASKET_ACCESSORY_LABELS.none },
    { key: 'perforated_paper', label: BASKET_ACCESSORY_LABELS.perforated_paper },
    { key: 'bowl_paper_liner', label: BASKET_ACCESSORY_LABELS.bowl_paper_liner },
    { key: 'silicone_mold', label: BASKET_ACCESSORY_LABELS.silicone_mold },
    { key: 'metal_baking_pan', label: BASKET_ACCESSORY_LABELS.metal_baking_pan },
  ];

  onModelAliasChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    void this.hardwareStore.updateProfile({ modelAlias: val });
  }

  onCapacityChange(tier: BasketCapacityTier): void {
    void this.hardwareStore.setBasketCapacity(tier);
  }

  onPowerWattsChange(watts: number): void {
    void this.hardwareStore.updateProfile({ nominalPowerWatts: watts });
  }

  onMaxTempChange(maxTempCelsius: 200 | 205 | 230): void {
    void this.hardwareStore.updateProfile({ maxTempCelsius });
  }

  onAccessoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as BasketAccessoryType;
    void this.hardwareStore.setDefaultAccessory(val);
  }

  onTempUnitChange(unit: TemperatureUnit): void {
    void this.hardwareStore.updateProfile({ preferredTempUnit: unit });
  }

  onTogglePreheat(): void {
    void this.hardwareStore.updateProfile({
      enablePreheatingByDefault: !this.hardwareStore.profile().enablePreheatingByDefault,
    });
  }

  onExportPersonalForks(): void {
    const json = this.forkStore.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `crisp-craft-personal-forks-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.toast.success('Backup exportado', 'Tus notas y favoritos se han descargado en JSON.');
  }
}

