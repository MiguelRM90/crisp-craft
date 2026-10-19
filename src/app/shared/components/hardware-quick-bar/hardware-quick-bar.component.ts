import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import {
  BASKET_ACCESSORY_LABELS,
  BasketAccessoryType,
  BasketCapacityTier,
  HardwareProfileStoreService,
} from '../../../core';

@Component({
  selector: 'app-hardware-quick-bar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hardware-quick-bar.component.html',
  styleUrl: './hardware-quick-bar.component.css',
})
export class HardwareQuickBarComponent {
  readonly hardwareStore = inject(HardwareProfileStoreService);
  readonly openFullModal = output<void>();

  readonly capacityOptions: readonly { readonly value: BasketCapacityTier; readonly shortLabel: string }[] = [
    { value: 'compact_under_4l', shortLabel: '< 4L' },
    { value: 'standard_5_to_6l', shortLabel: '5–6L' },
    { value: 'large_over_6l', shortLabel: '> 6L' },
  ];

  readonly accessoryOptions: readonly { readonly value: BasketAccessoryType; readonly label: string }[] = [
    { value: 'none', label: 'Sin papel / Cesta libre' },
    { value: 'perforated_paper', label: 'Papel perforado (+5% t)' },
    { value: 'bowl_paper_liner', label: 'Bandeja papel (+10% t)' },
    { value: 'silicone_mold', label: 'Molde silicona (+16% t, +5°C)' },
    { value: 'metal_baking_pan', label: 'Molde metálico (+6% t)' },
  ];

  readonly accessoryLabels = BASKET_ACCESSORY_LABELS;

  onSelectCapacity(tier: BasketCapacityTier): void {
    void this.hardwareStore.setBasketCapacity(tier);
  }

  onAccessoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    void this.hardwareStore.setDefaultAccessory(select.value as BasketAccessoryType);
  }

  onToggleDualElement(): void {
    void this.hardwareStore.toggleDualHeatingElement();
  }
}

