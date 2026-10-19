import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import { PwaToastService } from 'pwa-ui-core/services';
import {
  BasketAccessoryType,
  CatalogStoreService,
  CookingTimerService,
  DifficultyLevel,
  FoodPhysicsClass,
  HardwareProfileStoreService,
  MEAL_CATEGORY_LABELS,
  PersonalForkStoreService,
  RecipeDetail,
  calculateCompensatedCooking,
} from '../../core';
import { DurationFormatPipe, TemperatureUnitPipe } from '../../shared';
import { CompensationBannerComponent } from './components/compensation-banner/compensation-banner.component';
import { InteractiveCookingTimerComponent } from './components/interactive-cooking-timer/interactive-cooking-timer.component';
import { PersonalForkEditorComponent } from './components/personal-fork-editor/personal-fork-editor.component';
import { CommunityTipsPanelComponent } from './components/community-tips-panel/community-tips-panel.component';

@Component({
  selector: 'app-recipe-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    PwaBadgeComponent,
    DurationFormatPipe,
    TemperatureUnitPipe,
    CompensationBannerComponent,
    InteractiveCookingTimerComponent,
    PersonalForkEditorComponent,
    CommunityTipsPanelComponent,
  ],
  templateUrl: './recipe-detail-page.component.html',
  styleUrl: './recipe-detail-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailPageComponent {
  readonly slug = input.required<string>();

  private readonly router = inject(Router);
  private readonly toastService = inject(PwaToastService);
  readonly catalogStore = inject(CatalogStoreService);
  readonly hardwareStore = inject(HardwareProfileStoreService);
  readonly forkStore = inject(PersonalForkStoreService);
  readonly timerService = inject(CookingTimerService);

  readonly recipe = signal<RecipeDetail | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly selectedServings = signal<number>(2);
  readonly accessoryOverride = signal<BasketAccessoryType | undefined>(undefined);
  readonly completedSteps = signal<ReadonlySet<number>>(new Set<number>());

  readonly categoryLabels = MEAL_CATEGORY_LABELS;
  readonly difficultyLabels: Readonly<Record<DifficultyLevel, string>> = {
    1: 'Fácil',
    2: 'Media',
    3: 'Avanzada',
  };
  readonly physicsLabels: Readonly<Record<FoodPhysicsClass, string>> = {
    lean_protein: 'Proteína magra',
    lean_protein_with_topping: 'Proteína gratinada',
    fatty_protein: 'Proteína jugosa',
    root_vegetables_bastons: 'Tubérculos crujientes',
    tender_vegetables: 'Vegetales tiernos',
    battered_or_breaded: 'Empanados y rebozados',
    bakery_pastry_dough: 'Masas y repostería',
    frozen_precooked: 'Congelados directos',
    reheat_crispy: 'Regeneración crujiente',
  };

  readonly activeFork = computed(() => {
    const current = this.recipe();
    if (!current) {
      return null;
    }
    return this.forkStore.getFork(current.id);
  });

  readonly isFavorite = computed(() => {
    const current = this.recipe();
    return current ? this.forkStore.isFavorite(current.id) : false;
  });

  readonly servingMultiplier = computed(() => {
    const current = this.recipe();
    if (!current || current.searchIndex.servings <= 0) {
      return 1;
    }
    return this.selectedServings() / current.searchIndex.servings;
  });

  readonly compensationResult = computed(() => {
    const current = this.recipe();
    if (!current) {
      return null;
    }
    return calculateCompensatedCooking(
      current,
      this.hardwareStore.profile(),
      this.activeFork(),
      this.selectedServings(),
      this.accessoryOverride()
    );
  });

  readonly scaledIngredientGroups = computed(() => {
    const current = this.recipe();
    if (!current) {
      return [];
    }
    const mult = this.servingMultiplier();
    return current.ingredientGroups.map((group) => ({
      purpose: group.purpose,
      items: group.items.map((item) => ({
        ...item,
        scaledQty: Math.round(item.qty * mult * 10) / 10,
      })),
    }));
  });

  constructor() {
    effect(() => {
      const targetSlug = this.slug();
      if (targetSlug) {
        void this.loadRecipeBySlug(targetSlug);
      }
    });
  }

  private async loadRecipeBySlug(slug: string): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const detail = await this.catalogStore.loadRecipeBySlugOrId(slug);
      if (!detail) {
        this.loadError.set('No hemos encontrado la receta solicitada en el catálogo.');
        this.isLoading.set(false);
        return;
      }

      this.recipe.set(detail);
      const fork = this.forkStore.getFork(detail.id);
      this.selectedServings.set(fork?.customServingsOverride ?? detail.searchIndex.servings);
      this.accessoryOverride.set(undefined);
      this.completedSteps.set(new Set<number>());
    } catch {
      this.loadError.set('Error al cargar el bloque de datos de esta receta.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onServingsChange(servings: number): void {
    const next = Math.min(12, Math.max(1, servings));
    this.selectedServings.set(next);
  }

  adjustServings(delta: number): void {
    this.onServingsChange(this.selectedServings() + delta);
  }

  onAccessoryOverride(accessory: BasketAccessoryType): void {
    this.accessoryOverride.set(accessory);
  }

  async toggleFavorite(): Promise<void> {
    const current = this.recipe();
    if (!current) {
      return;
    }
    await this.forkStore.toggleFavorite(current.id);
    const nowFav = this.forkStore.isFavorite(current.id);
    if (nowFav) {
      this.toastService.success('Favorita guardada', 'Receta añadida a tus favoritos locales.');
    } else {
      this.toastService.info('Favorita eliminada', 'Receta retirada de tus favoritos.');
    }
  }

  toggleStepCompletion(stepOrder: number): void {
    this.completedSteps.update((prev) => {
      const next = new Set(prev);
      if (next.has(stepOrder)) {
        next.delete(stepOrder);
      } else {
        next.add(stepOrder);
      }
      return next;
    });
  }

  isStepCompleted(stepOrder: number): boolean {
    return this.completedSteps().has(stepOrder);
  }

  async onStartBannerTimer(req: { readonly durationSec: number; readonly labelSuffix: string }): Promise<void> {
    const current = this.recipe();
    const comp = this.compensationResult();
    if (!current || !comp) {
      return;
    }

    const title = req.labelSuffix ? `${current.title} ${req.labelSuffix}` : current.title;
    await this.timerService.startTimer({
      recipeId: current.id,
      recipeSlug: current.slug,
      recipeTitle: title,
      targetTempC: comp.effectiveTempC,
      totalDurationSec: req.durationSec,
      triggers: comp.triggers,
    });
  }

  async startRecipeTimer(): Promise<void> {
    const comp = this.compensationResult();
    if (!comp) {
      return;
    }
    await this.onStartBannerTimer({
      durationSec: comp.effectiveCookSec,
      labelSuffix: '',
    });
  }

  goBackToCatalog(): void {
    void this.router.navigate(['/']);
  }
}

