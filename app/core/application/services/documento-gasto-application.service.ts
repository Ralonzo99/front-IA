import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DocumentoGasto } from '../../domain/entities/factura.entity';
import { OcrService } from './ocr.service';

/**
 * Servicio de aplicación para la gestión de documentos de gastos
 * Maneja el ciclo de vida de procesamiento y análisis de documentos
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentoGastoApplicationService {

  private documentosSubject = new BehaviorSubject<DocumentoGasto[]>([]);
  documentos$ = this.documentosSubject.asObservable();

  private documentoSeleccionadoSubject =
    new BehaviorSubject<DocumentoGasto | null>(null);

  documentoSeleccionado$ =
    this.documentoSeleccionadoSubject.asObservable();

  private procesandoSubject =
    new BehaviorSubject<boolean>(false);

  procesando$ = this.procesandoSubject.asObservable();

  private errorSubject =
    new BehaviorSubject<string | null>(null);

  error$ = this.errorSubject.asObservable();

  constructor(private ocrService: OcrService) {
    this.cargarDocumentosGuardados();
  }

  /**
   * Procesa un nuevo documento (imagen/PDF)
   */
  async procesarNuevoDocumento(
    archivo: File
  ): Promise<DocumentoGasto> {

    try {

      this.procesandoSubject.next(true);
      this.errorSubject.next(null);

      const documento =
        await this.ocrService.procesarDocumento(archivo);

      const documentos = this.documentosSubject.value;

      documentos.unshift(documento);

      this.documentosSubject.next(documentos);

      this.guardarDocumentosLocalmente(documentos);

      this.procesandoSubject.next(false);

      return documento;

    } catch (error) {

      const mensaje =
        error instanceof Error
          ? error.message
          : 'Error desconocido';

      this.errorSubject.next(mensaje);

      this.procesandoSubject.next(false);

      throw error;
    }
  }

  /**
   * Selecciona un documento para verlo en detalle
   */
  seleccionarDocumento(documento: DocumentoGasto): void {
    this.documentoSeleccionadoSubject.next(documento);
  }

  /**
   * Obtiene el total de gastos
   */
  obtenerTotalGastos(): number {

    return this.documentosSubject.value.reduce(
      (total, doc) => total + doc.montoTotal,
      0
    );

  }

  /**
   * Obtiene gastos por categoría
   */
  obtenerGastosPorCategoria(): Map<string, number> {

    const mapa = new Map<string, number>();

    this.documentosSubject.value.forEach(doc => {

      const total = mapa.get(doc.categoria) || 0;

      mapa.set(
        doc.categoria,
        total + doc.montoTotal
      );

    });

    return mapa;
  }

  /**
   * Elimina un documento
   */
  eliminarDocumento(id: string): void {

    const documentos =
      this.documentosSubject.value.filter(
        doc => doc.id !== id
      );

    this.documentosSubject.next(documentos);

    this.guardarDocumentosLocalmente(documentos);

    if (this.documentoSeleccionadoSubject.value?.id === id) {
      this.documentoSeleccionadoSubject.next(null);
    }
  }

  /**
   * Actualiza un documento
   */
  actualizarDocumento(documento: DocumentoGasto): void {

    const documentos =
      this.documentosSubject.value.map(doc =>
        doc.id === documento.id ? documento : doc
      );

    this.documentosSubject.next(documentos);

    this.guardarDocumentosLocalmente(documentos);

    this.documentoSeleccionadoSubject.next(documento);
  }

  /**
   * Limpia almacenamiento local
   */
  limpiarTodo(): void {

    this.documentosSubject.next([]);

    this.documentoSeleccionadoSubject.next(null);

    // Evita error SSR
    if (typeof window !== 'undefined') {
      localStorage.removeItem('documentos_gastos');
    }
  }

  /**
   * Guarda documentos en localStorage
   */
  private guardarDocumentosLocalmente(
    documentos: DocumentoGasto[]
  ): void {

    try {

      // Evita error SSR
      if (typeof window === 'undefined') {
        return;
      }

      localStorage.setItem(
        'documentos_gastos',
        JSON.stringify(documentos)
      );

    } catch (error) {

      console.warn(
        'No se pudo guardar en localStorage:',
        error
      );

    }
  }

  /**
   * Carga documentos guardados
   */
  private cargarDocumentosGuardados(): void {

    try {

      // Evita error SSR
      if (typeof window === 'undefined') {
        return;
      }

      const guardados =
        localStorage.getItem('documentos_gastos');

      if (guardados) {
        this.documentosSubject.next(
          JSON.parse(guardados)
        );
      }

    } catch (error) {

      console.warn(
        'Error al cargar documentos guardados:',
        error
      );

    }
  }
}