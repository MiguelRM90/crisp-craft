import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CatalogStoreService } from '../../../../core';

@Component({
  selector: 'app-ingredient-pantry-picker',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ingredient-pantry-picker.component.html',
  styleUrl: './ingredient-pantry-picker.component.css',
})
export class IngredientPantryPickerComponent {
  readonly catalogStore = inject(CatalogStoreService);
  readonly isExpanded = signal<boolean>(false);
}

