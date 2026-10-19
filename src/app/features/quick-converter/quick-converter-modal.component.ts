import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { PwaBadgeComponent, PwaModalComponent, PwaNumericSliderComponent } from 'pwa-ui-core/components';
import {
  CookingTimerService,
  HardwareProfileStoreService,
  QuickConvertSourceMode,
  calculateQuickConversion,
} from '../../core';
import { TemperatureUnitPipe } from '../../shared/pipes/temperature-unit.pipe';

@Component({
  selector: 'app-quick-converter-modal',
  standalone: true,
  imports: [PwaModalComponent, PwaNumericSliderComponent, PwaBadgeComponent, TemperatureUnitPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quick-converter-modal.component.html',
  styleUrl: './quick-converter-modal.component.css',
})
export class QuickConverterModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly hardwareStore = inject(HardwareProfileStoreService);
  readonly timerService = inject(CookingTimerService);

  readonly sourceMode = signal<QuickConvertSourceMode>('static_oven_standard');
  readonly sourceTempC = signal<number>(200);
  readonly sourceTimeMin = signal<number>(25);

  readonly modes: readonly { readonly id: QuickConvertSourceMode; readonly title: string; readonly desc: string }[] = [
    {
      id: 'static_oven_standard',
      title: '🍖 Horno Estándar',
      desc: 'Asados, carnes, aves, verduras (−15°C · −20% t)',
    },
    {
      id: 'frozen_package',
      title: '🍟 Envase Congelado',
      desc: 'Croquetas, patatas, empanados de bolsa (−15°C · −8% t)',
    },
    {
      id: 'static_oven_bakery',
      title: '🧁 Repostería y Masas',
      desc: 'Bizcochos, hojaldres, gratinados delicados (−20°C · −20% t)',
    },
    {
      id: 'fan_oven_eu',
      title: '🌀 Horno con Ventilador',
      desc: 'Receta europea ya ajustada a convección (0°C · −10% t)',
    },
  ];

  readonly conversionResult = computed(() =>
    calculateQuickConversion(
      {
        sourceMode: this.sourceMode(),
        sourceTempC: this.sourceTempC(),
        sourceTimeMin: this.sourceTimeMin(),
      },
      this.hardwareStore.profile()
    )
  );

  async onStartConvertedTimer(): Promise<void> {
    const res = this.conversionResult();
    const totalSec = res.effectiveCookMin * 60;
    const shakeSec = res.shakeMinuteMark * 60;

    await this.timerService.startTimer({
      recipeId: 'quick_converter',
      recipeSlug: '',
      recipeTitle: `Conversión Rápida (${res.effectiveTempC} °C)`,
      targetTempC: res.effectiveTempC,
      totalDurationSec: totalSec,
      triggers: [
        {
          type: 'shake_basket',
          pctTrigger: 0.5,
          defaultMin: res.shakeMinuteMark,
          compensatedMinuteMark: res.shakeMinuteMark,
          compensatedSecondMark: shakeSec,
          suppressedByDualElement: false,
          label: 'Sacudir la cesta o dar la vuelta al alimento a mitad de ciclo.',
        },
      ],
    });
    this.close.emit();
  }
}

