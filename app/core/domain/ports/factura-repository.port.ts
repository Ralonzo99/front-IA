import { Factura } from '../entities/factura.entity';

export interface FacturaRepositoryPort {
  save(factura: Factura): Promise<Factura>;
  findById(id: string): Promise<Factura | null>;
  findAll(): Promise<Factura[]>;
  update(id: string, factura: Factura): Promise<Factura>;
  delete(id: string): Promise<boolean>;

  getInfoComprobante(payload: { tokenRequest: string }): Promise<any>;
  getPDFComprobante(payload: { tokenRequest: string }): Promise<Blob>;
  getXMLComprobante(payload: { tokenRequest: string }): Promise<Blob>;
}