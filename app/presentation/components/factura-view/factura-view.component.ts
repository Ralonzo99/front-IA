import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FacturaHttpAdapter } from '../../../infrastructure/adapters/factura-http.adapter';

@Component({
  selector: 'app-factura-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factura-view.component.html',
  styleUrls: ['./factura-view.component.css']
})
export class FacturaViewComponent implements OnInit {

  pdfUrl: SafeResourceUrl | null = null;
  isLoading = false;
  tokenActual = '';
  isDarkMode = false;
  errorMessage: string | null = null;
  pdfAlerta: string | null = null;
  tipoComprobante: string = 'Comprobante'; // Aquí se guardará "Factura"

  facturaData: any = {
    numero: '',
    estado: '',
    emisor: { nombre: '', ruc: '', nombreComercial: '' },
    receptor: { nombre: '', correo: '' },
    fechaEmision: ''
  };

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private facturaAdapter: FacturaHttpAdapter,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = mediaQuery.matches;
      this.applyDarkClass(this.isDarkMode);

      mediaQuery.addEventListener('change', e => {
        this.isDarkMode = e.matches;
        this.applyDarkClass(e.matches);
        this.cdr.detectChanges();
      });

      this.route.queryParams.subscribe(params => {
        const token = params['tokenRequest'] || params['token'];
        if (token) {
          this.tokenActual = token;
          this.cargarData(token);
        } else {
          // Modo sin token - Muestra datos de demostración
          this.cargarDataDemo();
        }
      });
    }
  }

  private applyDarkClass(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add('app-dark');
    } else {
      document.documentElement.classList.remove('app-dark');
    }
  }

  async cargarData(token: string) {
    try {
      this.isLoading = true;
      this.errorMessage = null;
      this.pdfAlerta = null;

      const info = await this.facturaAdapter.getInfoComprobante({ tokenRequest: token });

      if (!info || !info.noComprobante) {
        this.errorMessage = 'El enlace ha expirado o es incorrecto.';
        return;
      }

      // CORRECCIÓN: Leemos directamente la propiedad "tipoComprobante" del JSON
      this.tipoComprobante = info.tipoComprobante || 'Comprobante';

      this.facturaData = {
        numero: info.noComprobante || '',
        estado: (info.estadoComprobante || '').replace(/_/g, ' '),
        emisor: {
          nombre: info.emisor || '',
          ruc: info.ruc || '',
          nombreComercial: info.nombreComercial || info.razonSocial || info.emisor || ''
        },
        receptor: {
          nombre: info.receptor || '',
          correo: info.correo || ''
        },
        fechaEmision: info.fechaEmision || ''
      };

      try {
        const pdf = await this.facturaAdapter.getPDFComprobante({ tokenRequest: token });
        if (pdf) {
          const clean = this.cleanBase64(pdf);
          const blob = this.base64ToBlob(clean, 'application/pdf');
          const url = URL.createObjectURL(blob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}#toolbar=1`);
        } else {
          this.pdfAlerta = 'El PDF no está disponible.';
        }
      } catch {
        this.pdfAlerta = 'Error al cargar el visor PDF.';
      }

    } catch (error) {
      this.errorMessage = 'Error de comunicación con el servidor.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private cargarDataDemo() {
    // Datos de demostración para visualizar el diseño sin token
    this.tipoComprobante = 'Factura';
    this.facturaData = {
      numero: '001-001-000000001',
      estado: 'AUTORIZADO',
      emisor: {
        nombre: 'EMPRESA EJEMPLO S.A.',
        ruc: '1234567890001',
        nombreComercial: 'EMPRESA EJEMPLO'
      },
      receptor: {
        nombre: 'CLIENTE DEMO',
        correo: 'cliente@ejemplo.com'
      },
      fechaEmision: '2026-05-21'
    };
    this.isLoading = false;
    this.errorMessage = null;
    this.pdfAlerta = 'Modo demostración - Sin PDF disponible';
    this.cdr.detectChanges();
  }

  getEstadoClass(estado: string): string {
    const e = estado?.toUpperCase().replace(/_/g, ' ').trim() || '';
    if (['AUTORIZADO', 'REGISTRADO'].includes(e)) return 'status-exito';
    if (['ANULADO'].includes(e)) return 'status-preventivo';
    if (['ERROR', 'NO AUTORIZADO', 'NO ENCONTRADO'].includes(e)) return 'status-error';
    return 'status-informativo';
  }

  private cleanBase64(data: any): string {
    let str = String(data || '').trim();
    if (str.startsWith('"') && str.endsWith('"')) str = str.substring(1, str.length - 1);
    return str.replace(/['"]+/g, '');
  }

  private base64ToBlob(base64: string, type: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type });
  }

  async descargarPDF() {
    if (!this.tokenActual) return;
    try {
      const base64 = await this.facturaAdapter.getPDFComprobante({ tokenRequest: this.tokenActual });
      const blob = this.base64ToBlob(this.cleanBase64(base64), 'application/pdf');
      this.descargarArchivo(blob, `${this.tipoComprobante}_${this.facturaData.numero}.pdf`);
    } catch (e) { console.error(e); }
  }

  async descargarXML() {
    if (!this.tokenActual) return;
    try {
      const xmlBase64 = await this.facturaAdapter.getXMLComprobante({ tokenRequest: this.tokenActual });
      const blob = this.base64ToBlob(this.cleanBase64(xmlBase64), 'application/xml');
      this.descargarArchivo(blob, `${this.tipoComprobante}_${this.facturaData.numero}.xml`);
    } catch (e) { console.error(e); }
  }

  private descargarArchivo(blob: Blob, nombre: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }
}