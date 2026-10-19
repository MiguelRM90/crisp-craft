import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import { PwaToastService } from 'pwa-ui-core/services';
import {
  BASKET_ACCESSORY_LABELS,
  BASKET_CAPACITY_LABELS,
  CommunityTipsFirestoreService,
  HardwareProfileStoreService,
  RecipeTipsBundleDocument,
} from '../../../../core';

@Component({
  selector: 'app-community-tips-panel',
  standalone: true,
  imports: [PwaBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './community-tips-panel.component.html',
  styleUrl: './community-tips-panel.component.css',
})
export class CommunityTipsPanelComponent {
  readonly recipeId = input.required<string>();

  private readonly tipsService = inject(CommunityTipsFirestoreService);
  readonly hardwareStore = inject(HardwareProfileStoreService);
  private readonly toast = inject(PwaToastService);

  readonly bundle = signal<RecipeTipsBundleDocument | null>(null);
  readonly authorAlias = signal<string>('');
  readonly comment = signal<string>('');
  readonly suggestedTimeDeltaMin = signal<number>(0);

  readonly capacityLabels = BASKET_CAPACITY_LABELS;
  readonly accessoryLabels = BASKET_ACCESSORY_LABELS;

  constructor() {
    effect(() => {
      const id = this.recipeId();
      void this.loadBundle(id);
    });
  }

  private async loadBundle(recipeId: string): Promise<void> {
    const doc = await this.tipsService.getTipsBundle(recipeId);
    this.bundle.set(doc);
  }

  onAliasInput(event: Event): void {
    this.authorAlias.set((event.target as HTMLInputElement).value);
  }

  onCommentInput(event: Event): void {
    this.comment.set((event.target as HTMLTextAreaElement).value);
  }

  onDeltaTimeChange(event: Event): void {
    this.suggestedTimeDeltaMin.set(Number((event.target as HTMLSelectElement).value));
  }

  async onSubmitTip(): Promise<void> {
    try {
      const hw = this.hardwareStore.profile();
      const updated = await this.tipsService.submitTip({
        recipeId: this.recipeId(),
        authorAlias: this.authorAlias() || hw.modelAlias,
        basketCapacity: hw.basketCapacity,
        hasDualHeatingElement: hw.hasDualHeatingElement,
        accessoryUsed: hw.defaultAccessory,
        suggestedTempDeltaC: 0,
        suggestedTimeDeltaMin: this.suggestedTimeDeltaMin(),
        comment: this.comment(),
      });
      this.bundle.set(updated);
      this.comment.set('');
      this.toast.success('Consejo publicado', 'Gracias por compartir tu experiencia con la comunidad.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar el consejo.';
      this.toast.warning('Aviso de cuota', msg);
    }
  }
}

