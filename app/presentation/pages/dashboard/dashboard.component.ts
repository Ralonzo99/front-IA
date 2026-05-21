import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentoGastoApplicationService } from '../../../core/application/services/documento-gasto-application.service';
import { DocumentoGasto } from '../../../core/domain/entities/factura.entity';
import { Observable } from 'rxjs';

interface CategoriaStats {
  nombre: string;
  total: number;
  porcentaje: number;
  cantidad: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container" [class.dark-mode]="isDarkMode">
      <!-- HEADER -->
      <header class="main-navbar">
        <div class="nav-content">
          <div class="header-title">
            <h1>📊 Dashboard de Gastos</h1>
            <p>Análisis inteligente de facturas y recibos procesados</p>
          </div>
          <button class="btn-back" [routerLink]="['/']">← Volver a Cargar</button>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="dashboard-viewport">
        
        <div *ngIf="(documentos$ | async) as documentos; else noData">
          
          <!-- KPIs SECTION -->
          <div class="kpis-grid">
            <div class="kpi-card">
              <div class="kpi-icon">💰</div>
              <h3>Total de Gastos</h3>
              <p class="kpi-value">{{ totalGastos | currency }}</p>
              <p class="kpi-label">{{ documentos.length }} documentos</p>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon">📈</div>
              <h3>Promedio por Documento</h3>
              <p class="kpi-value">{{ (totalGastos / documentos.length) | currency }}</p>
              <p class="kpi-label">calculado automáticamente</p>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon">✅</div>
              <h3>OCR Confianza</h3>
              <p class="kpi-value">{{ confianzaPromedio | number:'1.0-0' }}%</p>
              <p class="kpi-label">exactitud de extracción</p>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon">📁</div>
              <h3>Categoría Más Usada</h3>
              <p class="kpi-value">{{ categoriaMasUsada }}</p>
              <p class="kpi-label">{{ gastosPorCategoria.get(categoriaMasUsada) | currency }}</p>
            </div>
          </div>

          <!-- CHARTS SECTION -->
          <div class="charts-grid">
            
            <!-- GASTOS POR CATEGORIA -->
            <div class="chart-card">
              <h3>Breakdown por Categoría</h3>
              <div class="category-breakdown">
                <div *ngFor="let cat of categoriasStats" class="categoria-item">
                  <div class="categoria-bar-wrapper">
                    <div class="categoria-bar" 
                         [style.width]="cat.porcentaje + '%'"
                         [style.backgroundColor]="cat.color">
                    </div>
                  </div>
                  <div class="categoria-info">
                    <span class="categoria-name">{{ cat.nombre }}</span>
                    <span class="categoria-amount">{{ cat.total | currency }}</span>
                    <span class="categoria-percent">({{ cat.porcentaje | number:'1.0-0' }}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TENDENCIA TEMPORAL -->
            <div class="chart-card">
              <h3>Actividad por Fecha</h3>
              <div class="timeline">
                <div *ngFor="let fecha of obtenerFechasRecientes()" class="timeline-item">
                  <span class="fecha">{{ fecha | date:'dd/MM' }}</span>
                  <div class="timeline-bar">
                    <div class="timeline-fill" 
                         [style.width]="(getGastosPorFecha(fecha) / maxGastoPorDia * 100) + '%'">
                    </div>
                  </div>
                  <span class="monto">{{ getGastosPorFecha(fecha) | currency }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- DOCUMENTOS DETAIL TABLE -->
          <div class="table-card">
            <h3>📋 Documentos Procesados</h3>
            <div class="table-responsive">
              <table class="datos-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Categoría</th>
                    <th>OCR %</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let doc of documentos">
                    <td class="empresa"><strong>{{ doc.empresa }}</strong></td>
                    <td class="tipo">
                      <span class="tipo-badge" [ngClass]="'tipo-' + doc.tipoDocumento.toLowerCase()">
                        {{ doc.tipoDocumento }}
                      </span>
                    </td>
                    <td>{{ doc.fechaEmision | date:'dd/MM/yyyy' }}</td>
                    <td class="monto"><strong>{{ doc.montoTotal | currency }}</strong></td>
                    <td>
                      <span class="categoria-label" [ngClass]="'cat-' + doc.categoria.toLowerCase()">
                        {{ doc.categoria }}
                      </span>
                    </td>
                    <td>
                      <div class="ocr-confidence">
                        <div class="confidence-dot" [style.backgroundColor]="getConfianzaColor(doc.confianzaOCR)"></div>
                        {{ doc.confianzaOCR | number:'1.0-0' }}%
                      </div>
                    </td>
                    <td>
                      <span class="estado-badge" [ngClass]="'estado-' + doc.estado.toLowerCase()">
                        {{ doc.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- EXPORT SECTION -->
          <div class="export-section">
            <h3>📤 Descargar Reportes</h3>
            <div class="export-buttons">
              <button class="btn-export" (click)="exportarCSV()">📊 Descargar CSV</button>
              <button class="btn-export" (click)="exportarJSON()">📄 Descargar JSON</button>
              <button class="btn-export btn-danger" (click)="limpiarTodo()">
                🗑️ Limpiar Todo
              </button>
            </div>
          </div>

        </div>

        <ng-template #noData>
          <div class="empty-state">
            <p>📭 No hay datos para mostrar</p>
            <p class="hint">Sube documentos desde la página principal para ver el análisis</p>
            <button class="btn-primary" [routerLink]="['/']">Ir a Cargar Documentos</button>
          </div>
        </ng-template>

      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #2c3e50;
    }

    .dashboard-container.dark-mode {
      background: #1a1a2e;
      color: #ecf0f1;
    }

    .main-navbar {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 20px 40px;
      flex-shrink: 0;
    }

    .dashboard-container.dark-mode .main-navbar {
      background: #16213e;
      border-bottom-color: #333;
    }

    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #1d4ed8;
    }

    .dashboard-container.dark-mode .header-title h1 {
      color: #60a5fa;
    }

    .header-title p {
      font-size: 13px;
      color: #6b7280;
      margin: 4px 0 0;
    }

    .dashboard-container.dark-mode .header-title p {
      color: #9ca3af;
    }

    .btn-back {
      background: #e5e7eb;
      color: #1f2937;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-back:hover {
      background: #d1d5db;
    }

    .dashboard-container.dark-mode .btn-back {
      background: #374151;
      color: #ecf0f1;
    }

    .dashboard-container.dark-mode .btn-back:hover {
      background: #4b5563;
    }

    .dashboard-viewport {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* KPIs GRID */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .kpi-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      transition: all 0.3s;
    }

    .dashboard-container.dark-mode .kpi-card {
      background: #16213e;
      border-color: #374151;
    }

    .kpi-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .kpi-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }

    .kpi-card h3 {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dashboard-container.dark-mode .kpi-card h3 {
      color: #9ca3af;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: #1d4ed8;
      margin: 0 0 4px;
    }

    .dashboard-container.dark-mode .kpi-value {
      color: #60a5fa;
    }

    .kpi-label {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
    }

    /* CHARTS GRID */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .chart-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
    }

    .dashboard-container.dark-mode .chart-card {
      background: #16213e;
      border-color: #374151;
    }

    .chart-card h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 20px;
      color: #1f2937;
    }

    .dashboard-container.dark-mode .chart-card h3 {
      color: #ecf0f1;
    }

    /* CATEGORY BREAKDOWN */
    .category-breakdown {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .categoria-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .categoria-bar-wrapper {
      flex: 1;
      height: 32px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .dashboard-container.dark-mode .categoria-bar-wrapper {
      background: #374151;
    }

    .categoria-bar {
      height: 100%;
      transition: width 0.3s;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      color: white;
      font-weight: 600;
      font-size: 11px;
    }

    .categoria-info {
      min-width: 140px;
      text-align: right;
      font-size: 12px;
    }

    .categoria-name {
      display: block;
      font-weight: 600;
      color: #1f2937;
    }

    .dashboard-container.dark-mode .categoria-name {
      color: #ecf0f1;
    }

    .categoria-amount {
      display: block;
      color: #1d4ed8;
      font-weight: 700;
    }

    .dashboard-container.dark-mode .categoria-amount {
      color: #60a5fa;
    }

    .categoria-percent {
      display: block;
      color: #9ca3af;
      font-size: 11px;
    }

    /* TIMELINE */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .timeline-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }

    .fecha {
      min-width: 40px;
      font-weight: 600;
      color: #6b7280;
    }

    .dashboard-container.dark-mode .fecha {
      color: #9ca3af;
    }

    .timeline-bar {
      flex: 1;
      height: 24px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .dashboard-container.dark-mode .timeline-bar {
      background: #374151;
    }

    .timeline-fill {
      height: 100%;
      background: #1d4ed8;
      transition: width 0.3s;
    }

    .dashboard-container.dark-mode .timeline-fill {
      background: #60a5fa;
    }

    .timeline-item .monto {
      min-width: 80px;
      text-align: right;
      font-weight: 600;
      color: #1d4ed8;
    }

    .dashboard-container.dark-mode .timeline-item .monto {
      color: #60a5fa;
    }

    /* TABLE CARD */
    .table-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
    }

    .dashboard-container.dark-mode .table-card {
      background: #16213e;
      border-color: #374151;
    }

    .table-card h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 20px;
      color: #1f2937;
    }

    .dashboard-container.dark-mode .table-card h3 {
      color: #ecf0f1;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .datos-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .datos-table thead th {
      background: #f3f4f6;
      padding: 12px 8px;
      text-align: left;
      font-weight: 700;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }

    .dashboard-container.dark-mode .datos-table thead th {
      background: #374151;
      color: #9ca3af;
      border-bottom-color: #4b5563;
    }

    .datos-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s;
    }

    .dashboard-container.dark-mode .datos-table tbody tr {
      border-bottom-color: #374151;
    }

    .datos-table tbody tr:hover {
      background: #f9fafb;
    }

    .dashboard-container.dark-mode .datos-table tbody tr:hover {
      background: #1f2937;
    }

    .datos-table td {
      padding: 12px 8px;
    }

    .datos-table .empresa { color: #1f2937; }
    .dashboard-container.dark-mode .datos-table .empresa { color: #ecf0f1; }

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

    .datos-table .monto { color: #1d4ed8; }
    .dashboard-container.dark-mode .datos-table .monto { color: #60a5fa; }

    .categoria-label {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      background: #f0f0f0;
    }

    .dashboard-container.dark-mode .categoria-label {
      background: #374151;
      color: #ecf0f1;
    }

    .cat-servicios { background: #cffafe; color: #0c4a6e; }
    .cat-suministros { background: #ede9fe; color: #6b21a8; }
    .cat-transporte { background: #fed7aa; color: #92400e; }
    .cat-alimentos { background: #fecaca; color: #7f1d1d; }
    .cat-otros { background: #e5e7eb; color: #374151; }

    .ocr-confidence {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }

    .confidence-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .estado-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      background: #d1fae5;
      color: #065f46;
    }

    .estado-error { background: #fee2e2; color: #991b1b; }
    .estado-procesando { background: #fef3c7; color: #92400e; }

    /* EXPORT SECTION */
    .export-section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
    }

    .dashboard-container.dark-mode .export-section {
      background: #16213e;
      border-color: #374151;
    }

    .export-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 16px;
      color: #1f2937;
    }

    .dashboard-container.dark-mode .export-section h3 {
      color: #ecf0f1;
    }

    .export-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-export {
      background: #1d4ed8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-export:hover {
      background: #1e40af;
    }

    .btn-export.btn-danger {
      background: #dc2626;
    }

    .btn-export.btn-danger:hover {
      background: #b91c1c;
    }

    /* EMPTY STATE */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #6b7280;
    }

    .dashboard-container.dark-mode .empty-state {
      color: #9ca3af;
    }

    .empty-state p:first-child {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-state .hint {
      font-size: 14px;
      margin-bottom: 20px;
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
    }

    .btn-primary:hover {
      background: #1e40af;
    }

    @media (max-width: 1024px) {
      .charts-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .main-navbar { padding: 16px 20px; }
      .dashboard-viewport { padding: 20px; }
      .nav-content { flex-direction: column; gap: 12px; text-align: center; }
      .kpis-grid { grid-template-columns: 1fr 1fr; }
      .export-buttons { flex-direction: column; }
      .datos-table { font-size: 12px; }
      .datos-table td { padding: 8px; }
    }

    @media (max-width: 480px) {
      .kpis-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  
  isDarkMode = false;
  documentos$: Observable<DocumentoGasto[]>;
  
  totalGastos = 0;
  confianzaPromedio = 0;
  categoriaMasUsada = 'OTROS';
  maxGastoPorDia = 0;

  gastosPorCategoria: Map<string, number> = new Map();
  categoriasStats: CategoriaStats[] = [];

  constructor(private appService: DocumentoGastoApplicationService) {
    this.documentos$ = this.appService.documentos$;
    this.detectarTemaDark();
  }

  ngOnInit(): void {
    this.documentos$.subscribe(documentos => {
      this.calcularStats(documentos);
    });
  }

  private calcularStats(documentos: DocumentoGasto[]): void {
    if (documentos.length === 0) return;

    // Total
    this.totalGastos = documentos.reduce((sum, doc) => sum + doc.montoTotal, 0);

    // Confianza promedio
    this.confianzaPromedio = documentos.reduce((sum, doc) => sum + doc.confianzaOCR, 0) / documentos.length;

    // Gastos por categoría
    this.gastosPorCategoria = this.appService.obtenerGastosPorCategoria();
    this.categoriaMasUsada = Array.from(this.gastosPorCategoria.entries())
      .reduce((max, curr) => curr[1] > (max[1] || 0) ? curr : max, ['OTROS', 0])[0];

    // Stats por categoría para el gráfico
    const categorias: DocumentoGasto['categoria'][] = ['SERVICIOS', 'SUMINISTROS', 'TRANSPORTE', 'ALIMENTOS', 'OTROS'];
    const colores: { [key: string]: string } = {
      'SERVICIOS': '#0369a1',
      'SUMINISTROS': '#7c3aed',
      'TRANSPORTE': '#ea580c',
      'ALIMENTOS': '#dc2626',
      'OTROS': '#6b7280'
    };

    this.categoriasStats = categorias.map(cat => {
      const total = this.gastosPorCategoria.get(cat) || 0;
      const cantidad = documentos.filter(d => d.categoria === cat).length;
      const porcentaje = this.totalGastos > 0 ? (total / this.totalGastos) * 100 : 0;
      return {
        nombre: cat,
        total,
        porcentaje,
        cantidad,
        color: colores[cat]
      };
    }).filter(stat => stat.cantidad > 0);

    // Máximo gasto por día para la escala del gráfico
    const gastosPorFecha = new Map<string, number>();
    documentos.forEach(doc => {
      const fecha = this.formatearFecha(doc.fechaEmision);
      gastosPorFecha.set(fecha, (gastosPorFecha.get(fecha) || 0) + doc.montoTotal);
    });
    this.maxGastoPorDia = Math.max(...Array.from(gastosPorFecha.values()));
  }

  obtenerFechasRecientes(): Date[] {
    const fechas: Set<string> = new Set();
    let documentos: DocumentoGasto[] = [];
    this.documentos$.subscribe(docs => documentos = docs).unsubscribe();

    documentos.forEach(doc => {
      fechas.add(this.formatearFecha(doc.fechaEmision));
    });

    return Array.from(fechas)
      .map(f => new Date(f))
      .sort((a, b) => b.getTime() - a.getTime())
      .slice(0, 7);
  }

  getGastosPorFecha(fecha: Date): number {
    let documentos: DocumentoGasto[] = [];
    this.documentos$.subscribe(docs => documentos = docs).unsubscribe();

    return documentos
      .filter(doc => this.formatearFecha(doc.fechaEmision) === this.formatearFecha(fecha))
      .reduce((sum, doc) => sum + doc.montoTotal, 0);
  }

  private formatearFecha(fecha: Date | string): string {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toISOString().split('T')[0];
  }

  exportarCSV(): void {
    let documentos: DocumentoGasto[] = [];
    this.documentos$.subscribe(docs => documentos = docs).unsubscribe();

    const headers = ['Empresa', 'Tipo', 'Fecha', 'Monto', 'Categoría', 'Confianza OCR', 'Estado'];
    const rows = documentos.map(doc => [
      doc.empresa,
      doc.tipoDocumento,
      doc.fechaEmision,
      doc.montoTotal,
      doc.categoria,
      doc.confianzaOCR,
      doc.estado
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    this.descargarArchivo(csv, 'gastos.csv', 'text/csv');
  }

  exportarJSON(): void {
    let documentos: DocumentoGasto[] = [];
    this.documentos$.subscribe(docs => documentos = docs).unsubscribe();

    const json = JSON.stringify({
      exportadoEn: new Date(),
      totalGastos: this.totalGastos,
      cantidadDocumentos: documentos.length,
      confianzaPromedio: this.confianzaPromedio,
      documentos
    }, null, 2);

    this.descargarArchivo(json, 'gastos.json', 'application/json');
  }

  private descargarArchivo(contenido: string, nombre: string, tipo: string): void {
    const blob = new Blob([contenido], { type: tipo });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  limpiarTodo(): void {
    if (confirm('⚠️ ¿Estás seguro que deseas limpiar TODOS los documentos? Esta acción NO se puede deshacer.')) {
      this.appService.limpiarTodo();
    }
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
