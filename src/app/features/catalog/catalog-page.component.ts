import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import {
  CatalogStoreService,
  HardwareProfileStoreService,
  PersonalForkStoreService,
} from '../../core';
import { HardwareQuickBarComponent } from '../../shared/components/hardware-quick-bar/hardware-quick-bar.component';
import { CatalogFilterBarComponent } from './components/catalog-filter-bar/catalog-filter-bar.component';
import { IngredientPantryPickerComponent } from './components/ingredient-pantry-picker/ingredient-pantry-picker.component';
import { RecipeIndexCardComponent } from './components/recipe-index-card/recipe-index-card.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    HardwareQuickBarComponent,
    CatalogFilterBarComponent,
    IngredientPantryPickerComponent,
    RecipeIndexCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
})
export class CatalogPageComponent {
  readonly catalogStore = inject(CatalogStoreService);
  readonly hardwareStore = inject(HardwareProfileStoreService);
  readonly forkStore = inject(PersonalForkStoreService);

  readonly requestHardwareModal = output<void>();
}

