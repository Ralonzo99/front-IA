import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Factura } from '../../core/domain/entities/factura.entity';
import { FacturaRepositoryPort } from '../../core/domain/ports/factura-repository.port';

@Injectable({
  providedIn: 'root'
})
export class FacturaStorageAdapter implements FacturaRepositoryPort {
  private storageKey = 'facturas';
  private facturas: Factura[] = [];
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.cargarFacturas();
    }
  }

  // --- MÉTODOS DE PREVISUALIZACIÓN (Implementación obligatoria) ---
  
  async getInfoComprobante(payload: any): Promise<any> {
    // El storage no consulta al backend, por lo que retorna null
    return null;
  }

  async getPDFComprobante(payload: any): Promise<Blob> {
    // Retorna un Blob vacío para evitar errores de tipo
    return new Blob();
  }

  async getXMLComprobante(payload: any): Promise<Blob> {
    return new Blob();
  }

  // --- LÓGICA DE PERSISTENCIA LOCAL ---

  private cargarFacturas(): void {
    if (!this.isBrowser) return;
    const stored = localStorage.getItem(this.storageKey);
    this.facturas = stored ? JSON.parse(stored) : [];
  }

  private guardarFacturas(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageKey, JSON.stringify(this.facturas));
  }

  async save(factura: Factura): Promise<Factura> {
    if (!this.isBrowser) return factura;
    factura.id = Date.now().toString();
    this.facturas.push(factura);
    this.guardarFacturas();
    return factura;
  }

  async findById(id: string): Promise<Factura | null> {
    if (!this.isBrowser) return null;
    return this.facturas.find(f => f.id === id) || null;
  }

  async findAll(): Promise<Factura[]> {
    if (!this.isBrowser) return [];
    return this.facturas;
  }

  async update(id: string, factura: Factura): Promise<Factura> {
    if (!this.isBrowser) return factura;
    const index = this.facturas.findIndex(f => f.id === id);
    if (index !== -1) {
      this.facturas[index] = { ...factura, id };
      this.guardarFacturas();
      return this.facturas[index];
    }
    throw new Error('Factura no encontrada');
  }

  async delete(id: string): Promise<boolean> {
    if (!this.isBrowser) return false;
    const index = this.facturas.findIndex(f => f.id === id);
    if (index !== -1) {
      this.facturas.splice(index, 1);
      this.guardarFacturas();
      return true;
    }
    return false;
  }
}