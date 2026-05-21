import { Injectable } from '@angular/core';
import { DocumentoGasto } from '../../domain/entities/factura.entity';

/**
 * Servicio OCR para procesar documentos (facturas, recibos, etc.)
 * Extrae información automáticamente usando análisis inteligente
 */
@Injectable({
  providedIn: 'root'
})
export class OcrService {
  
  /**
   * Procesa un archivo de imagen/PDF y extrae datos automáticamente
   * @param archivo El archivo a procesar
   * @returns Documento procesado con datos extraídos
   */
  async procesarDocumento(archivo: File): Promise<DocumentoGasto> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const base64 = e.target?.result as string;
          const resultado = await this.analizarDocumento(base64, archivo.name);
          resolve(resultado);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(archivo);
    });
  }

  /**
   * Análisis inteligente del documento
   * En una aplicación real, esto se enviaría a un backend con IA/OCR
   */
  private async analizarDocumento(base64: string, nombreArchivo: string): Promise<DocumentoGasto> {
    // Simulación de procesamiento OCR
    // En producción, esto consumiría un API de OCR (Google Vision, Azure Computer Vision, etc.)
    
    const documentoSimulado: DocumentoGasto = {
      id: this.generarId(),
      montoTotal: this.extraerMontoPrueba(),
      moneda: 'USD',
      fechaEmision: new Date(),
      empresa: 'Proveedor ' + this.generarProveedorAleatorio(),
      numeroDocumento: Math.floor(Math.random() * 1000000).toString(),
      tipoDocumento: 'FACTURA',
      categoria: this.asignarCategoriaAleatorio(),
      descripcion: `Documento: ${nombreArchivo}`,
      detalleItems: [
        {
          descripcion: 'Servicio/Producto',
          cantidad: 1,
          unitario: this.extraerMontoPrueba(),
          total: this.extraerMontoPrueba()
        }
      ],
      confianzaOCR: 85 + Math.random() * 15, // 85-100%
      imagenOriginal: base64,
      procesadoEn: new Date(),
      estado: 'COMPLETADO'
    };
    
    return documentoSimulado;
  }

  /**
   * Recategoriza un documento con una categoría diferente
   */
  recategorizarDocumento(documento: DocumentoGasto, nuevaCategoria: DocumentoGasto['categoria']): DocumentoGasto {
    return { ...documento, categoria: nuevaCategoria };
  }

  /**
   * Obtiene sugerencias de categoría basadas en el texto del documento
   */
  sugerirCategoria(descripcion: string): DocumentoGasto['categoria'] {
    const texto = descripcion.toLowerCase();
    
    if (texto.includes('transporte') || texto.includes('gasolina') || texto.includes('taxi')) return 'TRANSPORTE';
    if (texto.includes('comida') || texto.includes('restaurante') || texto.includes('café')) return 'ALIMENTOS';
    if (texto.includes('suministro') || texto.includes('material')) return 'SUMINISTROS';
    if (texto.includes('servicio') || texto.includes('consultoría')) return 'SERVICIOS';
    
    return 'OTROS';
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private extraerMontoPrueba(): number {
    return Math.round(Math.random() * 10000 * 100) / 100;
  }

  private generarProveedorAleatorio(): string {
    const proveedores = ['ABC S.A.', 'TechCorp', 'Servicios Integrales', 'Distribuidora XYZ'];
    return proveedores[Math.floor(Math.random() * proveedores.length)];
  }

  private asignarCategoriaAleatorio(): DocumentoGasto['categoria'] {
    const categorias: DocumentoGasto['categoria'][] = [
      'SERVICIOS', 'SUMINISTROS', 'TRANSPORTE', 'ALIMENTOS', 'OTROS'
    ];
    return categorias[Math.floor(Math.random() * categorias.length)];
  }
}
