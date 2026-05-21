import { Routes } from '@angular/router';
import { DocumentoUploadComponent } from './presentation/components/documento-upload/documento-upload.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { DocumentoDetailComponent } from './presentation/components/documento-detail/documento-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: DocumentoUploadComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'documento/:id',
    component: DocumentoDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];