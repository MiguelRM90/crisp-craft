import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaToastContainerComponent } from 'pwa-ui-core/components';
import { AppHeaderComponent, FloatingTimerPillComponent } from './shared';
import { HardwareSettingsModalComponent } from './features/hardware-settings/hardware-settings-modal.component';
import { QuickConverterModalComponent } from './features/quick-converter/quick-converter-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PwaToastContainerComponent,
    AppHeaderComponent,
    FloatingTimerPillComponent,
    HardwareSettingsModalComponent,
    QuickConverterModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly isHardwareModalOpen = signal<boolean>(false);
  readonly isQuickConverterOpen = signal<boolean>(false);

  openHardwareModal(): void {
    this.isHardwareModalOpen.set(true);
  }

  closeHardwareModal(): void {
    this.isHardwareModalOpen.set(false);
  }

  openQuickConverter(): void {
    this.isQuickConverterOpen.set(true);
  }

  closeQuickConverter(): void {
    this.isQuickConverterOpen.set(false);
  }
}
