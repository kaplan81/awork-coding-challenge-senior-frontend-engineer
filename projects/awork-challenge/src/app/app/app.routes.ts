import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('../users/users.routes').then((feature) => feature.routes),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];
