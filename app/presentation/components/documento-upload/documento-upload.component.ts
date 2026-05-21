import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoGastoApplicationService } from '../../../core/application/services/documento-gasto-application.service';
import { DocumentoGasto } from '../../../core/domain/entities/factura.entity';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-documento-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="ocr-container" [class.dark-mode]="isDarkMode">
      <!-- HEADER -->
      <header class="main-navbar">
        <div class="nav-content">
          <div class="logo-section">
            <h1 class="app-title">📊 Analizador de Gastos OCR</h1>
            <p class="app-subtitle">Procesa automáticamente facturas y recibos</p>
          </div>
          <button class="btn-secondary" *ngIf="documentosGuardados > 0" [routerLink]="['/dashboard']">
            Ver Dashboard ({{ documentosGuardados }})
          </button>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="main-viewport">
        
        <!-- UPLOAD ZONE -->
        <div class="upload-container">
          <div 
            class="drop-zone"
            [class.drag-over]="isDragOver"
            (drop)="onDrop($event)"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)">
            
            <div class="upload-icon">📸</div>
            <h2>Sube una Factura o Recibo</h2>
            <p class="upload-hint">Arrastra aquí o haz clic para seleccionar</p>
            
            <input 
              #fileInput 
              type="file" 
              hidden 
              multiple
              accept="image/*,.pdf"
              (change)="onFileSelected($event)"
              aria-label="Seleccionar archivos">
            
            <button 
              class="btn-primary"
              (click)="fileInput.click()">
              Seleccionar Archivo
            </button>
          </div>

          <!-- SUPPORTED FORMATS -->
          <div class="formats-info">
            <p>📁 Formatos soportados: JPG, PNG, PDF</p>
            <p>📝 Procesamiento automático con OCR inteligente</p>
          </div>
        </div>

        <!-- PROCESSING STATE -->
        <div *ngIf="procesando$ | async" class="processing-overlay">
          <div class="spinner"></div>
          <p>Analizando documento con OCR...</p>
        </div>

        <!-- ERROR MESSAGE -->
        <div *ngIf="error$ | async as error" class="error-banner">
          <span>❌ {{ error }}</span>
          <button class="btn-close" (click)="cerrarError()">×</button>
        </div>

        <!-- SUCCESS MESSAGE -->
        <div *ngIf="ultimoDocumentoProcesado" class="success-banner">
          <div class="success-content">
            <h3>✓ Documento procesado exitosamente</h3>
            <div class="documento-preview">
              <p><strong>Empresa:</strong> {{ ultimoDocumentoProcesado.empresa }}</p>
              <p><strong>Monto:</strong> {{ ultimoDocumentoProcesado.montoTotal | currency }}</p>
              <p><strong>Categoría:</strong> {{ ultimoDocumentoProcesado.categoria }}</p>
              <p><strong>Confianza OCR:</strong> {{ ultimoDocumentoProcesado.confianzaOCR | number:'1.0-0' }}%</p>
            </div>
            <button class="btn-secondary" (click)="verDetalles(ultimoDocumentoProcesado)">
              Ver Detalles
            </button>
          </div>
        </div>

        <!-- DOCUMENTS LIST -->
        <div class="documentos-list" *ngIf="(documentos$ | async) as documentos; else sinDocumentos">
          <h3 class="list-title">📋 Documentos Procesados ({{ documentos.length }})</h3>
          
          <div class="documento-card" *ngFor="let doc of documentos">
            <div class="card-header">
              <div class="card-title">
                <span class="tipo-badge" [ngClass]="'tipo-' + doc.tipoDocumento.toLowerCase()">
                  {{ doc.tipoDocumento }}
                </span>
                <span class="empresa-name">{{ doc.empresa }}</span>
              </div>
              <span class="monto" [ngClass]="'categoria-' + doc.categoria.toLowerCase()">
                {{ doc.montoTotal | currency }}
              </span>
            </div>
            
            <div class="card-details">
              <div class="detail-item">
                <label>Fecha:</label>
                <span>{{ doc.fechaEmision | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="detail-item">
                <label>Categoría:</label>
                <span class="categoria-tag">{{ doc.categoria }}</span>
              </div>
              <div class="detail-item">
                <label>Confianza OCR:</label>
                <div class="confidence-bar">
                  <div class="confidence-fill" [style.width]="(doc.confianzaOCR / 100 * 100) + '%'"
                       [style.backgroundColor]="getConfianzaColor(doc.confianzaOCR)">
                  </div>
                  <span class="confidence-text">{{ doc.confianzaOCR | number:'1.0-0' }}%</span>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="btn-action" (click)="verDetalles(doc)">Ver</button>
              <button class="btn-danger" (click)="eliminarDocumento(doc.id)">Eliminar</button>
            </div>
          </div>
        </div>

        <ng-template #sinDocumentos>
          <div class="empty-state">
            <p>📭 No hay documentos procesados aún</p>
            <p class="hint">Sube una factura o recibo para comenzar</p>
          </div>
        </ng-template>

      </main>
    </div>
  `,
  styles: [`
    .ocr-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #2c3e50;
      transition: background-color 0.3s;
    }

    .ocr-container.dark-mode {
      background: #1a1a2e;
      color: #ecf0f1;
    }

    .main-navbar {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 20px 40px;
      flex-shrink: 0;
    }

    .ocr-container.dark-mode .main-navbar {
      background: #16213e;
      border-bottom-color: #333;
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      flex: 1;
    }

    .app-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #1d4ed8;
    }

    .ocr-container.dark-mode .app-title {
      color: #60a5fa;
    }

    .app-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin: 4px 0 0;
    }

    .ocr-container.dark-mode .app-subtitle {
      color: #9ca3af;
    }

    .main-viewport {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    /* UPLOAD ZONE */
    .upload-container {
      margin-bottom: 40px;
    }

    .drop-zone {
      border: 2px dashed #d0d0d0;
      border-radius: 12px;
      padding: 60px 20px;
      text-align: center;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .ocr-container.dark-mode .drop-zone {
      background: #16213e;
      border-color: #444;
    }

    .drop-zone:hover {
      background: #f0f7ff;
      border-color: #1d4ed8;
    }

    .ocr-container.dark-mode .drop-zone:hover {
      background: #1f2937;
      border-color: #60a5fa;
    }

    .drop-zone.drag-over {
      background: #dbeafe;
      border-color: #1d4ed8;
      box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
    }

    .ocr-container.dark-mode .drop-zone.drag-over {
      background: #1f2937;
      border-color: #60a5fa;
    }

    .upload-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .drop-zone h2 {
      font-size: 20px;
      margin: 12px 0;
    }

    .upload-hint {
      color: #6b7280;
      font-size: 14px;
      margin: 8px 0 24px;
    }

    .ocr-container.dark-mode .upload-hint {
      color: #9ca3af;
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
    }

    .btn-primary:hover {
      background: #1e40af;
    }

    .ocr-container.dark-mode .btn-primary {
      background: #2563eb;
    }

    .ocr-container.dark-mode .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #1f2937;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .ocr-container.dark-mode .btn-secondary {
      background: #374151;
      color: #ecf0f1;
    }

    .ocr-container.dark-mode .btn-secondary:hover {
      background: #4b5563;
    }

    .formats-info {
      margin-top: 12px;
      font-size: 12px;
      color: #6b7280;
    }

    .ocr-container.dark-mode .formats-info {
      color: #9ca3af;
    }

    /* PROCESSING OVERLAY */
    .processing-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .processing-overlay p {
      color: white;
      margin-top: 16px;
      font-weight: 600;
    }

    /* BANNERS */
    .error-banner {
      background: #fee2e2;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ocr-container.dark-mode .error-banner {
      background: #7f1d1d;
      color: #fecaca;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
    }

    .success-banner {
      background: #d1fae5;
      border: 1px solid #6ee7b7;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .ocr-container.dark-mode .success-banner {
      background: #065f46;
      border-color: #10b981;
    }

    .success-content {
      background: white;
      padding: 16px;
      border-radius: 6px;
    }

    .ocr-container.dark-mode .success-content {
      background: #1f2937;
      color: #ecf0f1;
    }

    .success-content h3 {
      margin: 0 0 12px;
      color: #065f46;
      font-size: 16px;
    }

    .ocr-container.dark-mode .success-content h3 {
      color: #10b981;
    }

    .documento-preview {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 13px;
    }

    .ocr-container.dark-mode .documento-preview {
      background: #374151;
    }

    .documento-preview p {
      margin: 4px 0;
    }

    /* DOCUMENTS LIST */
    .documentos-list {
      background: white;
      border-radius: 12px;
      padding: 24px;
    }

    .ocr-container.dark-mode .documentos-list {
      background: #16213e;
    }

    .list-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 20px;
      color: #1f2937;
    }

    .ocr-container.dark-mode .list-title {
      color: #ecf0f1;
    }

    .documento-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }

    .ocr-container.dark-mode .documento-card {
      border-color: #374151;
    }

    .documento-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .tipo-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      background: #e5e7eb;
      color: #374151;
    }

    .tipo-factura { background: #dbeafe; color: #0c4a6e; }
    .tipo-recibo { background: #fce7f3; color: #831843; }
    .tipo-nota_credito { background: #d1fae5; color: #065f46; }

    .empresa-name {
      font-weight: 600;
      color: #1f2937;
    }

    .ocr-container.dark-mode .empresa-name {
      color: #ecf0f1;
    }

    .monto {
      font-size: 18px;
      font-weight: 700;
      color: #1d4ed8;
    }

    .categoria-servicios { color: #0369a1; }
    .categoria-suministros { color: #7c3aed; }
    .categoria-transporte { color: #ea580c; }
    .categoria-alimentos { color: #dc2626; }
    .categoria-otros { color: #6b7280; }

    .card-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .ocr-container.dark-mode .card-details {
      border-bottom-color: #374151;
    }

    .detail-item {
      font-size: 13px;
    }

    .detail-item label {
      font-weight: 600;
      color: #6b7280;
      display: block;
      margin-bottom: 4px;
    }

    .ocr-container.dark-mode .detail-item label {
      color: #9ca3af;
    }

    .categoria-tag {
      display: inline-block;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .ocr-container.dark-mode .categoria-tag {
      background: #374151;
      color: #ecf0f1;
    }

    .confidence-bar {
      background: #e5e7eb;
      border-radius: 4px;
      height: 24px;
      overflow: hidden;
      position: relative;
    }

    .ocr-container.dark-mode .confidence-bar {
      background: #374151;
    }

    .confidence-fill {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 700;
      transition: width 0.3s;
    }

    .confidence-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
      color: #1f2937;
    }

    .ocr-container.dark-mode .confidence-text {
      color: #ecf0f1;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .ocr-container.dark-mode .btn-action {
      background: #374151;
      border-color: #4b5563;
      color: #ecf0f1;
    }

    .btn-action:hover {
      background: #f3f4f6;
    }

    .ocr-container.dark-mode .btn-action:hover {
      background: #4b5563;
    }

    .btn-danger {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #fecaca;
      border-radius: 4px;
      background: #fee2e2;
      color: #991b1b;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .ocr-container.dark-mode .btn-danger {
      background: #7f1d1d;
      border-color: #dc2626;
      color: #fecaca;
    }

    .btn-danger:hover {
      background: #fecaca;
      color: #7f1d1d;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .ocr-container.dark-mode .empty-state {
      color: #9ca3af;
    }

    .empty-state p:first-child {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-state .hint {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .main-navbar { padding: 16px 20px; }
      .nav-content { flex-direction: column; gap: 12px; }
      .main-viewport { padding: 20px; }
      .card-details { grid-template-columns: 1fr; }
    }
  `]
})
export class DocumentoUploadComponent implements OnInit {
  
  isDragOver = false;
  isDarkMode = false;
  ultimoDocumentoProcesado: DocumentoGasto | null = null;

  documentos$: Observable<DocumentoGasto[]>;
  procesando$: Observable<boolean>;
  error$: Observable<string | null>;
  
  get documentosGuardados(): number {
    let count = 0;
    this.documentos$.subscribe(docs => count = docs.length).unsubscribe();
    return count;
  }
constructor(
  private appService: DocumentoGastoApplicationService,
  private router: Router
) {
  this.documentos$ = this.appService.documentos$;
  this.procesando$ = this.appService.procesando$;
  this.error$ = this.appService.error$;

  this.detectarTemaDark();
}

  ngOnInit(): void {
    // Detectar cambios de tema
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          this.isDarkMode = e.matches;
        });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;

    if (files) {
      this.procesarArchivos(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      this.procesarArchivos(input.files);
      input.value = '';
    }
  }

  private async procesarArchivos(files: FileList): Promise<void> {
    for (let i = 0; i < files.length; i++) {
      const archivo = files[i];

      try {
        const documento =
          await this.appService.procesarNuevoDocumento(archivo);

        this.ultimoDocumentoProcesado = documento;

        setTimeout(() => {
          if (this.ultimoDocumentoProcesado?.id === documento.id) {
            this.ultimoDocumentoProcesado = null;
          }
        }, 5000);

      } catch (error) {
        console.error(
          'Error procesando archivo:',
          archivo.name,
          error
        );
      }
    }
  }

  verDetalles(documento: DocumentoGasto): void {
    this.appService.seleccionarDocumento(documento);
    this.router.navigate(['/documento', documento.id]);
  }

  eliminarDocumento(id: string): void {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      this.appService.eliminarDocumento(id);
    }
  }

  cerrarError(): void {
    console.log('Cerrar error');
  }

  getConfianzaColor(confianza: number): string {
    if (confianza >= 90) return '#10b981';
    if (confianza >= 70) return '#f59e0b';
    return '#ef4444';
  }

  private detectarTemaDark(): void {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      this.isDarkMode = true;
    }
  }
}