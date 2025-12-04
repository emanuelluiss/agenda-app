import { Routes } from '@angular/router';

export const routes: Routes = [
  {
  path: '',
  loadChildren: () => import('./features/agenda/agenda.routes').then(m => m.AGENDA_ROUTES)
  },

  // Rota Coringa (Wildcard): Se digitar qualquer url maluca, volta para o início
  {
    path: '**',
    redirectTo: ''
  }
];
