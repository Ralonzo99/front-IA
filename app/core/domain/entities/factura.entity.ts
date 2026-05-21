/**
 * Entidad que representa un documento de gasto (factura, recibo, nota de crédito, etc.)
 * procesado por el sistema OCR inteligente
 */
export interface DocumentoGasto {
  id: string;

  // Datos extraídos por OCR
  montoTotal: number;
  moneda: string; // USD, EUR, etc.
  fechaEmision: Date | string;
  empresa: string; // Nombre del emisor/proveedor
  numeroDocumento?: string;

  tipoDocumento:
    | 'FACTURA'
    | 'RECIBO'
    | 'NOTA_CREDITO'
    | 'BOLETA'
    | 'GASTO_GENERAL';

  // Datos de análisis
  categoria:
    | 'SERVICIOS'
    | 'SUMINISTROS'
    | 'TRANSPORTE'
    | 'ALIMENTOS'
    | 'OTROS';

  descripcion?: string;

  detalleItems?: {
    descripcion: string;
    cantidad: number;
    unitario: number;
    total: number;
  }[];

  // Metadata OCR
  confianzaOCR: number; // 0-100% de confianza en la extracción
  imagenOriginal?: string; // Base64 de la imagen
  procesadoEn: Date | string;

  estado:
    | 'PROCESANDO'
    | 'COMPLETADO'
    | 'ERROR'
    | 'REVISION_MANUAL';

  erroresDetectados?: string[];
}

/**
 * Alias para mantener compatibilidad con imports antiguos
 */
export type Factura = DocumentoGasto;