import { Routes } from '@angular/router';
import { FacturaViewComponent } from './presentation/components/factura-view/factura-view.component';

export const routes: Routes = [
  {
    path: '', // Página de inicio
    component: FacturaViewComponent
  },
  {
    path: 'factura',
    component: FacturaViewComponent
  },
  {
    path: '**', // Si escriben cualquier ruta inexistente
    redirectTo: ''
  }
];