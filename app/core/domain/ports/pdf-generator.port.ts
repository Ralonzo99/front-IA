import { Factura } from '../entities/factura.entity';

export interface PdfGeneratorPort {
  // Quitamos el '?' para que sea obligatorio y TypeScript no dé error
  generate(factura: Factura): Promise<void>;
  
  // Mantenemos este por si lo usas en otros servicios
  generarPDFDesdeHTML(elementoId: string): Promise<string>;
}