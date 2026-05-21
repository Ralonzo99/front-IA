import { Injectable, Inject } from '@angular/core';
import { PDF_GENERATOR_TOKEN } from '../../../app.config';
import { PdfGeneratorPort } from '../../domain/ports/pdf-generator.port';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  constructor(
    @Inject(PDF_GENERATOR_TOKEN) private pdfGenerator: PdfGeneratorPort
  ) {}

  async crearPdfDesdeVista(elementoId: string): Promise<string> {
    // Ahora el Port ya reconoce este método
    const pdfBase64 = await this.pdfGenerator.generarPDFDesdeHTML(elementoId);
    return pdfBase64;
  }
}