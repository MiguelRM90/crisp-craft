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
  CompensatedCookingParameters,
  PersonalForkStoreService,
  RecipePersonalFork,
} from '../../../../core';

@Component({
  selector: 'app-personal-fork-editor',
  standalone: true,
  imports: [PwaBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personal-fork-editor.component.html',
  styleUrl: './personal-fork-editor.component.css',
})
export class PersonalForkEditorComponent {
  readonly recipeId = input.required<string>();
  readonly fork = input<RecipePersonalFork | null>(null);
  readonly compensation = input.required<CompensatedCookingParameters>();

  readonly forkStore = inject(PersonalForkStoreService);
  readonly toast = inject(PwaToastService);

  readonly customCookMin = signal<number | undefined>(undefined);
  readonly customTempC = signal<number | undefined>(undefined);
  readonly notesText = signal<string>('');
  readonly rating = signal<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

  constructor() {
    effect(() => {
      const current = this.fork();
      this.customCookMin.set(current?.customCookMinOverride);
      this.customTempC.set(current?.customTempCOverride);
      this.notesText.set(current?.personalNotes ?? '');
      this.rating.set(current?.personalRating);
    });
  }

  onCookMinInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const num = Number(raw);
    this.customCookMin.set(raw && !Number.isNaN(num) && num > 0 ? Math.round(num) : undefined);
  }

  onTempCInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    const num = Number(raw);
    this.customTempC.set(raw && !Number.isNaN(num) && num >= 100 ? Math.round(num) : undefined);
  }

  onNotesInput(event: Event): void {
    this.notesText.set((event.target as HTMLTextAreaElement).value);
  }

  async onSavePersonalFork(): Promise<void> {
    const existing = this.fork();
    const updated: RecipePersonalFork = {
      recipeId: this.recipeId(),
      isFavorite: existing?.isFavorite ?? true,
      customCookMinOverride: this.customCookMin(),
      customTempCOverride: this.customTempC(),
      personalNotes: this.notesText().trim(),
      stepNotes: existing?.stepNotes ?? {},
      personalRating: this.rating(),
      timesCooked: existing?.timesCooked ?? 1,
      lastCookedAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };

    await this.forkStore.saveFork(updated);
    this.toast.success(
      'Personal Fork guardado en local',
      'Tus tiempos y notas personales se han guardado en IndexedDB.'
    );
  }

  async onResetOverrides(): Promise<void> {
    this.customCookMin.set(undefined);
    this.customTempC.set(undefined);
    await this.forkStore.clearForkOverrides(this.recipeId());
    this.toast.info(
      'Cálculo automático restaurado',
      'La receta vuelve a usar el compensador termodinámico de tu freidora.'
    );
  }
}

