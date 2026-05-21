import { Injectable } from '@angular/core';
import { PdfGeneratorPort } from '../../core/domain/ports/pdf-generator.port';
import { Factura } from '../../core/domain/entities/factura.entity';

@Injectable({
  providedIn: 'root'
})
export class PdfHtmlAdapter implements PdfGeneratorPort {
  
  // Implementación para el objeto factura
  async generate(factura: Factura): Promise<void> {
    console.log('Generando PDF para la factura:', factura.numero);
  }

  // Implementación para el HTML
  async generarPDFDesdeHTML(elementoId: string): Promise<string> {
    console.log('Generando desde HTML:', elementoId);
    return ""; 
  }
}