import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PwaBadgeComponent, PwaNumericSliderComponent } from 'pwa-ui-core/components';
import {
  AirFryerHardwareProfile,
  BASKET_ACCESSORY_LABELS,
  BASKET_CAPACITY_LABELS,
  BasketAccessoryType,
  CompensatedCookingParameters,
  RecipeDetail,
} from '../../../../core';
import { TemperatureUnitPipe } from '../../../../shared/pipes/temperature-unit.pipe';

@Component({
  selector: 'app-compensation-banner',
  standalone: true,
  imports: [PwaBadgeComponent, PwaNumericSliderComponent, TemperatureUnitPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compensation-banner.component.html',
  styleUrl: './compensation-banner.component.css',
})
export class CompensationBannerComponent {
  readonly recipe = input.required<RecipeDetail>();
  readonly hardware = input.required<AirFryerHardwareProfile>();
  readonly compensation = input.required<CompensatedCookingParameters>();
  readonly servings = input.required<number>();

  readonly servingsChange = output<number>();
  readonly accessoryOverrideChange = output<BasketAccessoryType>();
  readonly startTimerRequest = output<{ readonly durationSec: number; readonly labelSuffix: string }>();

  readonly useMultiBatchMode = signal<boolean>(false);

  readonly capacityLabels = BASKET_CAPACITY_LABELS;
  readonly accessoryLabels = BASKET_ACCESSORY_LABELS;

  readonly accessoryOptions: readonly { readonly value: BasketAccessoryType; readonly label: string }[] = [
    { value: 'none', label: 'Sin papel / Cesta desnuda' },
    { value: 'perforated_paper', label: 'Papel perforado (+5% t)' },
    { value: 'bowl_paper_liner', label: 'Bandeja papel (+10% t)' },
    { value: 'silicone_mold', label: 'Molde silicona (+16% t, +5°C)' },
    { value: 'metal_baking_pan', label: 'Molde metálico (+6% t)' },
  ];

  onAccessorySelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as BasketAccessoryType;
    this.accessoryOverrideChange.emit(val);
  }

  onLaunchMainTimer(): void {
    const comp = this.compensation();
    const split = comp.batchSplitPlan;
    if (this.useMultiBatchMode() && split) {
      this.startTimerRequest.emit({
        durationSec: split.firstBatchCookMin * 60,
        labelSuffix: `(Tanda 1 de ${split.recommendedBatches})`,
      });
      return;
    }

    this.startTimerRequest.emit({
      durationSec: comp.effectiveCookSec,
      labelSuffix: '',
    });
  }

  onLaunchSecondBatchTimer(): void {
    const split = this.compensation().batchSplitPlan;
    if (!split) return;
    this.startTimerRequest.emit({
      durationSec: split.subsequentBatchCookMin * 60,
      labelSuffix: `(Tanda 2 en caliente −10% t)`,
    });
  }
}

