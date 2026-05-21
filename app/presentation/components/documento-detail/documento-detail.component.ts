import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DocumentoGastoApplicationService } from '../../../core/application/services/documento-gasto-application.service';
import { DocumentoGasto } from '../../../core/domain/entities/factura.entity';
import { OcrService } from '../../../core/application/services/ocr.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-documento-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="detail-container" [class.dark-mode]="isDarkMode">
      <header class="main-navbar">
        <div class="nav-content">
          <button class="btn-back" routerLink="/">← Volver</button>
          <h1>Detalle del Documento</h1>
          <div></div>
        </div>
      </header>

      <main class="detail-viewport">
        <div *ngIf="documento$ | async as documento; else noData" class="documento-detail">
          
          <!-- PREVIEW IMAGE -->
          <div class="preview-section" *ngIf="documento.imagenOriginal">
            <h3>📸 Documento Original</h3>
            <img [src]="documento.imagenOriginal" alt="Documento original" class="documento-image">
          </div>

          <!-- EXTRACTED DATA -->
          <div class="data-section">
            <h3>📋 Datos Extraídos</h3>
            
            <form [formGroup]="formulario" (ngSubmit)="guardarCambios()" class="form-grid">
              
              <!-- ROW 1: Tipo y Número -->
              <div class="form-group">
                <label>Tipo de Documento</label>
                <select formControlName="tipoDocumento" class="form-control">
                  <option value="FACTURA">Factura</option>
                  <option value="RECIBO">Recibo</option>
                  <option value="NOTA_CREDITO">Nota de Crédito</option>
                  <option value="BOLETA">Boleta</option>
                  <option value="GASTO_GENERAL">Gasto General</option>
                </select>
              </div>

              <div class="form-group">
                <label>Número de Documento</label>
                <input type="text" formControlName="numeroDocumento" class="form-control">
              </div>

              <!-- ROW 2: Empresa y Fecha -->
              <div class="form-group">
                <label>Empresa/Proveedor</label>
                <input type="text" formControlName="empresa" class="form-control">
              </div>

              <div class="form-group">
                <label>Fecha de Emisión</label>
                <input type="date" formControlName="fechaEmision" class="form-control">
              </div>

              <!-- ROW 3: Monto y Moneda -->
              <div class="form-group">
                <label>Monto Total</label>
                <input type="number" step="0.01" formControlName="montoTotal" class="form-control">
              </div>

              <div class="form-group">
                <label>Moneda</label>
                <input type="text" formControlName="moneda" class="form-control" maxlength="3">
              </div>

              <!-- ROW 4: Categoría -->
              <div class="form-group form-full">
                <label>Categoría</label>
                <select formControlName="categoria" class="form-control">
                  <option value="SERVICIOS">Servicios</option>
                  <option value="SUMINISTROS">Suministros</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="ALIMENTOS">Alimentos</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              <!-- ROW 5: Descripción -->
              <div class="form-group form-full">
                <label>Descripción</label>
                <textarea formControlName="descripcion" class="form-control textarea" rows="3"></textarea>
              </div>

              <!-- OCR CONFIDENCE -->
              <div class="form-group form-full">
                <label>Confianza de OCR: {{ documento.confianzaOCR | number:'1.0-0' }}%</label>
                <div class="confidence-bar-large">
                  <div class="confidence-fill" [style.width]="(documento.confianzaOCR / 100 * 100) + '%'"
                       [style.backgroundColor]="getConfianzaColor(documento.confianzaOCR)">
                  </div>
                </div>
              </div>

              <!-- ITEMS DETAIL -->
              <div class="form-group form-full" *ngIf="documento.detalleItems && documento.detalleItems.length > 0">
                <label>Detalles de Artículos</label>
                <div class="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Unitario</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of documento.detalleItems">
                        <td>{{ item.descripcion }}</td>
                        <td>{{ item.cantidad }}</td>
                        <td>{{ item.unitario | currency }}</td>
                        <td>{{ item.total | currency }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- BUTTONS -->
              <div class="form-actions form-full">
                <button type="submit" class="btn-save">💾 Guardar Cambios</button>
                <button type="button" class="btn-delete" (click)="eliminar()">🗑️ Eliminar</button>
              </div>

            </form>
          </div>

          <!-- METADATA -->
          <div class="metadata-section">
            <h3>ℹ️ Metadatos</h3>
            <div class="metadata-grid">
              <div class="metadata-item">
                <label>ID del Documento</label>
                <code>{{ documento.id }}</code>
              </div>
              <div class="metadata-item">
                <label>Estado</label>
                <span class="status-badge" [ngClass]="'estado-' + documento.estado.toLowerCase()">
                  {{ documento.estado }}
                </span>
              </div>
              <div class="metadata-item">
                <label>Procesado en</label>
                <span>{{ documento.procesadoEn | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="metadata-item" *ngIf="documento.erroresDetectados && documento.erroresDetectados.length > 0">
                <label>Errores Detectados</label>
                <ul class="errors-list">
                  <li *ngFor="let error of documento.erroresDetectados">{{ error }}</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <ng-template #noData>
          <div class="empty-state">
            <p>📭 No hay documento seleccionado</p>
            <button class="btn-primary" routerLink="/">Volver a la Lista</button>
          </div>
        </ng-template>

      </main>
    </div>
  `,
  styles: [`
    .detail-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #2c3e50;
    }

    .detail-container.dark-mode {
      background: #1a1a2e;
      color: #ecf0f1;
    }

    .main-navbar {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 40px;
      flex-shrink: 0;
    }

    .detail-container.dark-mode .main-navbar {
      background: #16213e;
      border-bottom-color: #333;
    }

    .nav-content {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-back {
      background: #e5e7eb;
      color: #1f2937;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .detail-container.dark-mode .btn-back {
      background: #374151;
      color: #ecf0f1;
    }

    .btn-back:hover {
      background: #d1d5db;
    }

    .detail-container.dark-mode .btn-back:hover {
      background: #4b5563;
    }

    .detail-viewport {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }

    .documento-detail {
      background: white;
      border-radius: 12px;
      padding: 24px;
    }

    .detail-container.dark-mode .documento-detail {
      background: #16213e;
    }

    .preview-section {
      margin-bottom: 40px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 24px;
    }

    .detail-container.dark-mode .preview-section {
      border-bottom-color: #374151;
    }

    .preview-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .documento-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      max-height: 400px;
    }

    .detail-container.dark-mode .documento-image {
      border-color: #374151;
    }

    .data-section {
      margin-bottom: 40px;
    }

    .data-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 6px;
      color: #6b7280;
    }

    .detail-container.dark-mode .form-group label {
      color: #9ca3af;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      background: white;
      color: #1f2937;
      font-family: inherit;
    }

    .detail-container.dark-mode .form-control {
      background: #374151;
      color: #ecf0f1;
      border-color: #4b5563;
    }

    .form-control:focus {
      outline: none;
      border-color: #1d4ed8;
      box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
    }

    .textarea {
      resize: vertical;
      font-family: monospace;
      font-size: 12px;
    }

    .confidence-bar-large {
      height: 24px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .detail-container.dark-mode .confidence-bar-large {
      background: #374151;
    }

    .confidence-fill {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 11px;
      transition: width 0.3s;
    }

    .items-table {
      overflow-x: auto;
      margin-top: 8px;
    }

    .items-table table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .items-table th {
      background: #f3f4f6;
      padding: 8px;
      text-align: left;
      font-weight: 700;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-container.dark-mode .items-table th {
      background: #374151;
      color: #9ca3af;
      border-bottom-color: #4b5563;
    }

    .items-table td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-container.dark-mode .items-table td {
      border-bottom-color: #374151;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-save {
      flex: 1;
      background: #1d4ed8;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-save:hover {
      background: #1e40af;
    }

    .btn-delete {
      flex: 1;
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-delete:hover {
      background: #fecaca;
      color: #7f1d1d;
    }

    .metadata-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
    }

    .detail-container.dark-mode .metadata-section {
      border-top-color: #374151;
    }

    .metadata-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .metadata-item {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 6px;
    }

    .detail-container.dark-mode .metadata-item {
      background: #374151;
    }

    .metadata-item label {
      font-weight: 700;
      font-size: 12px;
      color: #6b7280;
      display: block;
      margin-bottom: 4px;
    }

    .detail-container.dark-mode .metadata-item label {
      color: #9ca3af;
    }

    .metadata-item code {
      font-family: monospace;
      font-size: 11px;
      color: #1f2937;
      word-break: break-all;
    }

    .detail-container.dark-mode .metadata-item code {
      color: #ecf0f1;
    }

    .status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      background: #d1fae5;
      color: #065f46;
    }

    .estado-error { background: #fee2e2; color: #991b1b; }
    .estado-procesando { background: #fef3c7; color: #92400e; }

    .errors-list {
      list-style: none;
      padding: 0;
      margin: 4px 0;
    }

    .errors-list li {
      padding: 4px 0;
      color: #dc2626;
      font-size: 11px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .btn-primary {
      background: #1d4ed8;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
    }

    .btn-primary:hover {
      background: #1e40af;
    }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .detail-viewport { padding: 20px; }
      .documento-detail { padding: 16px; }
    }
  `]
})
export class DocumentoDetailComponent implements OnInit {
  
  isDarkMode = false;
  documento$: Observable<DocumentoGasto | null>;
  formulario: FormGroup;

  constructor(
    private appService: DocumentoGastoApplicationService,
    private ocrService: OcrService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.documento$ = this.appService.documentoSeleccionado$;
    this.formulario = this.fb.group({
      tipoDocumento: [''],
      numeroDocumento: [''],
      empresa: [''],
      fechaEmision: [''],
      montoTotal: [0],
      moneda: [''],
      categoria: [''],
      descripcion: ['']
    });
    this.detectarTemaDark();
  }

  ngOnInit(): void {
    this.documento$.subscribe(documento => {
      if (documento) {
        this.formulario.patchValue({
          tipoDocumento: documento.tipoDocumento,
          numeroDocumento: documento.numeroDocumento,
          empresa: documento.empresa,
          fechaEmision: this.formatearParaInput(documento.fechaEmision),
          montoTotal: documento.montoTotal,
          moneda: documento.moneda,
          categoria: documento.categoria,
          descripcion: documento.descripcion
        });
      }
    });
  }

  guardarCambios(): void {
    this.documento$.subscribe(documento => {
      if (documento) {
        const actualizado: DocumentoGasto = {
          ...documento,
          ...this.formulario.value
        };
        this.appService.actualizarDocumento(actualizado);
        alert('✓ Cambios guardados exitosamente');
      }
    }).unsubscribe();
  }

  eliminar(): void {
    this.documento$.subscribe(documento => {
      if (documento && confirm('¿Estás seguro que deseas eliminar este documento?')) {
        this.appService.eliminarDocumento(documento.id);
        this.router.navigate(['/']);
      }
    }).unsubscribe();
  }

  private formatearParaInput(fecha: Date | string): string {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toISOString().split('T')[0];
  }

  getConfianzaColor(confianza: number): string {
    if (confianza >= 90) return '#10b981';
    if (confianza >= 70) return '#f59e0b';
    return '#ef4444';
  }

  private detectarTemaDark(): void {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkMode = true;
    }
  }
}
