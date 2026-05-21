import { Injectable, Inject } from '@angular/core';
import { Factura } from '../../domain/entities/factura.entity';
import { FacturaRepositoryPort } from '../../domain/ports/factura-repository.port';
import { PdfGeneratorPort } from '../../domain/ports/pdf-generator.port';
// Importación corregida apuntando a app.config
import { FACTURA_REPOSITORY_TOKEN, PDF_GENERATOR_TOKEN } from '../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class FacturaApplicationService {
  constructor(
    @Inject(FACTURA_REPOSITORY_TOKEN) private facturaRepo: FacturaRepositoryPort,
    @Inject(PDF_GENERATOR_TOKEN) private pdfGenerator: PdfGeneratorPort
  ) {}

  async obtenerTodas(): Promise<Factura[]> {
    return await this.facturaRepo.findAll();
  }

  async obtenerPorId(id: string): Promise<Factura | null> {
    return await this.facturaRepo.findById(id);
  }

  async generarPdf(factura: Factura): Promise<void> {
    return await this.pdfGenerator.generate(factura);
  }
}