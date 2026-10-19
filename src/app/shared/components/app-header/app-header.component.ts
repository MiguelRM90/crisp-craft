import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PwaHeaderComponent } from 'pwa-ui-core/components';
import { ThemeService } from 'pwa-ui-core/services';
import {
  BASKET_CAPACITY_LABELS,
  HardwareProfileStoreService,
  PersonalForkStoreService,
} from '../../../core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, PwaHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
})
export class AppHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly hardwareStore = inject(HardwareProfileStoreService);
  readonly forkStore = inject(PersonalForkStoreService);

  readonly openHardwareSettings = output<void>();
  readonly openQuickConverter = output<void>();

  readonly capacityLabels = BASKET_CAPACITY_LABELS;
}

