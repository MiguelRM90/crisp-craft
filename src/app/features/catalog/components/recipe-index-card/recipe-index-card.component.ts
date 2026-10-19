import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import {
  AirFryerHardwareProfile,
  DIET_TAG_LABELS,
  MEAL_CATEGORY_LABELS,
  RecipeIndexItem,
  RecipePersonalFork,
  estimateIndexCardCooking,
} from '../../../../core';
import { TemperatureUnitPipe } from '../../../../shared/pipes/temperature-unit.pipe';

@Component({
  selector: 'app-recipe-index-card',
  standalone: true,
  imports: [RouterLink, PwaBadgeComponent, TemperatureUnitPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-index-card.component.html',
  styleUrl: './recipe-index-card.component.css',
})
export class RecipeIndexCardComponent {
  readonly item = input.required<RecipeIndexItem>();
  readonly hardware = input.required<AirFryerHardwareProfile>();
  readonly fork = input<RecipePersonalFork | null>(null);
  readonly canonicalIngredients = input<Readonly<Record<string, string>>>({});

  readonly toggleFavorite = output<string>();

  readonly categoryLabels = MEAL_CATEGORY_LABELS;
  readonly dietLabels = DIET_TAG_LABELS;

  readonly compensatedEstimate = computed(() =>
    estimateIndexCardCooking(this.item(), this.hardware(), this.fork())
  );

  onFavoriteClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit(this.item().id);
  }
}

