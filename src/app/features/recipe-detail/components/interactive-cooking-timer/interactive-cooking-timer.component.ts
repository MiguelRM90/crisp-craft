import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import {
  CompensatedCookingParameters,
  CookingTimerService,
  RecipeDetail,
} from '../../../../core';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';

@Component({
  selector: 'app-interactive-cooking-timer',
  standalone: true,
  imports: [PwaBadgeComponent, DurationFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './interactive-cooking-timer.component.html',
  styleUrl: './interactive-cooking-timer.component.css',
})
export class InteractiveCookingTimerComponent {
  readonly recipe = input.required<RecipeDetail>();
  readonly compensation = input.required<CompensatedCookingParameters>();

  readonly timer = inject(CookingTimerService);

  async onStartFullCycle(): Promise<void> {
    const rec = this.recipe();
    const comp = this.compensation();
    await this.timer.startTimer({
      recipeId: rec.id,
      recipeSlug: rec.slug,
      recipeTitle: rec.title,
      targetTempC: comp.effectiveTempC,
      totalDurationSec: comp.effectiveCookSec,
      triggers: comp.triggers,
    });
  }

  async onStartStepPhase(stepNum: number, durationSec: number): Promise<void> {
    const rec = this.recipe();
    const comp = this.compensation();
    await this.timer.startTimer({
      recipeId: `${rec.id}_step_${stepNum}`,
      recipeSlug: rec.slug,
      recipeTitle: `${rec.title} (Paso ${stepNum})`,
      targetTempC: comp.effectiveTempC,
      totalDurationSec: durationSec,
      triggers: [],
    });
  }
}

