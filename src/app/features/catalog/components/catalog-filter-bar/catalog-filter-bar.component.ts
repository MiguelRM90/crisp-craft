import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CatalogStoreService,
  DIET_TAG_LABELS,
  DietTag,
  MEAL_CATEGORY_LABELS,
  MealCategory,
  PersonalForkStoreService,
} from '../../../../core';

@Component({
  selector: 'app-catalog-filter-bar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-filter-bar.component.html',
  styleUrl: './catalog-filter-bar.component.css',
})
export class CatalogFilterBarComponent {
  readonly catalogStore = inject(CatalogStoreService);
  readonly forkStore = inject(PersonalForkStoreService);

  readonly categories: readonly { readonly id: MealCategory | 'all'; readonly label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'principal', label: MEAL_CATEGORY_LABELS.principal },
    { id: 'aperitivo', label: MEAL_CATEGORY_LABELS.aperitivo },
    { id: 'guarnicion', label: MEAL_CATEGORY_LABELS.guarnicion },
    { id: 'reposteria', label: MEAL_CATEGORY_LABELS.reposteria },
    { id: 'snack', label: MEAL_CATEGORY_LABELS.snack },
  ];

  readonly dietPills: readonly { readonly id: DietTag; readonly label: string }[] = [
    { id: 'alto_en_proteina', label: DIET_TAG_LABELS.alto_en_proteina },
    { id: 'sin_gluten', label: DIET_TAG_LABELS.sin_gluten },
    { id: 'vegetariano', label: DIET_TAG_LABELS.vegetariano },
    { id: 'vegano', label: DIET_TAG_LABELS.vegano },
    { id: 'bajo_en_carbohidratos', label: DIET_TAG_LABELS.bajo_en_carbohidratos },
  ];

  readonly timePresets: readonly { readonly maxMin: number | null; readonly label: string }[] = [
    { maxMin: null, label: 'Cualquier tiempo' },
    { maxMin: 20, label: '≤ 20 min' },
    { maxMin: 30, label: '≤ 30 min' },
  ];

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.catalogStore.searchQuery.set(val);
  }
}

