import { DocumentoGasto } from '../entities/factura.entity';

/**
 * Puerto (contrato) para la integración con servicios OCR
 * Permite swappear la implementación sin cambiar la lógica de negocio
 */
export interface OcrPort {
  /**
   * Procesa un documento y extrae información automáticamente
   * @param base64 Documento en formato base64
   * @param nombreArchivo Nombre del archivo para contexto
   * @returns Documento procesado con datos extraídos
   */
  procesarDocumento(base64: string, nombreArchivo: string): Promise<DocumentoGasto>;
}
