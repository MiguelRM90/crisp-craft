import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
  },
  {
    path: 'recipe/:slug',
    loadComponent: () =>
      import('./features/recipe-detail/recipe-detail-page.component').then(
        (m) => m.RecipeDetailPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
