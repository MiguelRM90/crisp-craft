import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import { CookingTimerService, HardwareProfileStoreService } from '../../../core';
import { DurationFormatPipe } from '../../pipes/duration-format.pipe';
import { TemperatureUnitPipe } from '../../pipes/temperature-unit.pipe';

@Component({
  selector: 'app-floating-timer-pill',
  standalone: true,
  imports: [RouterLink, PwaBadgeComponent, DurationFormatPipe, TemperatureUnitPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-timer-pill.component.html',
  styleUrl: './floating-timer-pill.component.css',
})
export class FloatingTimerPillComponent {
  readonly timer = inject(CookingTimerService);
  readonly hardwareStore = inject(HardwareProfileStoreService);

  onTogglePause(): void {
    const session = this.timer.session();
    if (!session) return;
    if (session.isPaused) {
      void this.timer.resumeTimer();
    } else {
      this.timer.pauseTimer();
    }
  }
}

