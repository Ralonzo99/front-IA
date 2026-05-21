import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FacturaApplicationService } from '../../../core/application/services/factura-application.service';

@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="screen-wrapper">
      
      <header class="main-navbar">
        <div class="nav-container">
          <img src="assets/logo.png" alt="Intuito S.A." class="logo-top">
          <a href="https://www.facturasintuitosa.com/" target="_blank" class="btn-login">
            Iniciar Sesión
          </a>
        </div>
      </header>

      <main class="main-layout">
        <div class="factura-card">
          
          <ng-container *ngIf="facturaData; else cargando">
            
            <div class="card-row border-b header-flex">
              <div class="title-group">
                <h1 class="invoice-title">Factura {{ facturaData.noComprobante }}</h1>
                <span class="badge-status">✔ {{ facturaData.estadoComprobante }}</span>
              </div>
            </div>

            <div class="card-row bg-light-info info-text">
              <p><strong>Emisor:</strong> {{ facturaData.emisor }} | <strong>RUC:</strong> {{ facturaData.ruc }}</p>
              <p><strong>Receptor:</strong> {{ facturaData.receptor }} | <strong>Fecha:</strong> {{ facturaData.fechaEmision | date:'dd/MM/yyyy' }}</p>
            </div>

            <div class="card-row border-b action-group">
              <button class="btn-action" (click)="descargarArchivo('pdf')">
                <span class="pill-icon red-bg">PDF</span> Descargar PDF
              </button>
              <button class="btn-action" (click)="descargarArchivo('xml')">
                <span class="pill-icon orange-bg">XML</span> Descargar XML
              </button>
            </div>

            <div class="pdf-viewer-area">
              <div class="pdf-wrapper">
                <iframe *ngIf="pdfUrlSeguro" [src]="pdfUrlSeguro" class="iframe-full"></iframe>
                <div *ngIf="!pdfUrlSeguro" class="waiting-box">
                  <div class="spinner"></div>
                  <p>Cargando vista previa...</p>
                </div>
              </div>
            </div>

            <footer class="card-footer">
              <div class="footer-left">
                <img src="assets/logo-inf.jfif" class="footer-img">
                <div class="footer-copy">
                  <p class="bold-text">Accede al historial de tus comprobantes recibidos</p>
                  <p class="sub-text">✔ Filtra y descarga PDF / XML en un clic</p>
                </div>
              </div>
              <button class="btn-portal">Acceder al Portal</button>
            </footer>

          </ng-container>

          <ng-template #cargando>
            <div class="loading-state">
              <div class="spinner dark"></div>
              <p>Conectando con API (localhost:7001)...</p>
            </div>
          </ng-template>

        </div>
      </main>
    </div>
  `,
  styles: [`
    /* RESET DE HOST */
    :host { display: block; }

    .screen-wrapper {
      position: fixed; /* Esto rompe cualquier contenedor padre */
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      display: flex; flex-direction: column;
      background: #f2f4f7;
      z-index: 9999;
    }

    .main-navbar {
      width: 100%; background: #ffffff;
      border-bottom: 1px solid #e1e4e8; padding: 10px 40px;
      flex-shrink: 0;
    }

    .nav-container {
      max-width: 1400px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
    }

    .logo-top { height: 42px; }
    .btn-login { background: #0056b3; color: white; padding: 8px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; }

    /* AJUSTE DEL MAIN LAYOUT PARA EL FULL SCREEN */
    .main-layout {
      flex: 1; /* Toma todo el alto disponible */
      padding: 20px 40px;
      display: flex;
      justify-content: center;
      overflow: hidden; /* Evita scrolls raros */
    }

    .factura-card {
      width: 100%; max-width: 1300px;
      height: 100%; /* La tarjeta se estira al alto del main-layout */
      background: white; border-radius: 10px;
      display: flex; flex-direction: column;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #dee2e6;
    }

    .card-row { padding: 12px 30px; flex-shrink: 0; }
    .border-b { border-bottom: 1px solid #f0f2f5; }
    .header-flex { display: flex; align-items: center; }
    .invoice-title { font-size: 20px; margin: 0; font-weight: 800; }
    .badge-status { background: #e6f7ed; color: #1e7e34; padding: 4px 12px; border-radius: 6px; font-weight: bold; margin-left: 15px; font-size: 12px; }
    .info-text p { margin: 4px 0; font-size: 13.5px; color: #4a5568; }

    .action-group { display: flex; gap: 15px; }
    .btn-action { background: white; border: 1px solid #cbd5e0; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; font-weight: 600; }
    .pill-icon { padding: 2px 6px; border-radius: 4px; color: white; font-size: 10px; margin-right: 8px; }
    .red-bg { background: #e53e3e; }
    .orange-bg { background: #dd6b20; }

    /* VISOR PDF DINÁMICO */
    .pdf-viewer-area {
      flex: 1; background: #525659;
      padding: 15px; display: flex; justify-content: center;
      min-height: 0; 
    }

    .pdf-wrapper { width: 100%; max-width: 1000px; height: 100%; background: white; position: relative; }
    .iframe-full { width: 100%; height: 100%; border: none; }

    .card-footer { padding: 12px 30px; border-top: 2px solid #0056b3; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; flex-shrink: 0; }
    .footer-img { width: 50px; height: 50px; border-radius: 8px; }
    .btn-portal { background: #0056b3; color: white; padding: 10px 25px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; }

    .spinner { width: 35px; height: 35px; border: 4px solid rgba(255,255,255,0.2); border-top: 4px solid #3182ce; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .waiting-box, .loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .waiting-box { background: #2d2d2d; color: white; width: 100%; height: 100%; position: absolute; }
  `]
})
export class FacturaListComponent implements OnInit {
  facturaData: any = null;
  pdfUrlSeguro: SafeResourceUrl | null = null;

  constructor(
    private facturaService: FacturaApplicationService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const facturas = await this.facturaService.obtenerTodas();
      if (facturas && facturas.length > 0) {
        this.facturaData = facturas[0];
        if (this.facturaData.pdfBase64) {
          const blobUrl = `data:application/pdf;base64,${this.facturaData.pdfBase64}`;
          this.pdfUrlSeguro = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        }
      }
    } catch (error) {
      console.error('Error: Revisa que el puerto 7001 esté activo.', error);
    }
  }

  descargarArchivo(tipo: string) {
    if (!this.facturaData?.pdfBase64) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${this.facturaData.pdfBase64}`;
    link.download = `Comprobante-${this.facturaData.noComprobante}.${tipo}`;
    link.click();
  }
}