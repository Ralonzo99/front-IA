import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura } from '../../core/domain/entities/factura.entity';
import { FacturaRepositoryPort } from '../../core/domain/ports/factura-repository.port';

@Injectable({
  providedIn: 'root'
})
export class FacturaHttpAdapter implements FacturaRepositoryPort {
  
  private readonly BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getInfoComprobante(payload: { tokenRequest: string }): Promise<any> {
    try {
      const url = `${this.BASE_URL}/info`;
      return await lastValueFrom(this.http.post<any>(url, payload));
    } catch (error) {
      console.error('Error en getInfoComprobante:', error);
      throw error;
    }
  }

  /**
   * Capturamos el PDF como texto porque el backend ya lo envía en Base64
   */
  async getPDFComprobante(payload: { tokenRequest: string }): Promise<any> {
    try {
      const url = `${this.BASE_URL}/pdf`;
      return await lastValueFrom(
        this.http.post(url, payload, { responseType: 'text' })
      );
    } catch (error) {
      console.error('Error al obtener PDF:', error);
      throw error;
    }
  }

  async getXMLComprobante(payload: { tokenRequest: string }): Promise<any> {
    try {
      const url = `${this.BASE_URL}/xml`;
      return await lastValueFrom(
        this.http.post(url, payload, { responseType: 'text' })
      );
    } catch (error) {
      console.error('Error en getXMLComprobante:', error);
      throw error;
    }
  }

  // Métodos de la interfaz Port
  async save(f: Factura): Promise<Factura> { return f; }
  async findById(id: string): Promise<Factura | null> { return null; }
  async findAll(): Promise<Factura[]> { return []; }
  async update(id: string, f: Factura): Promise<Factura> { return f; }
  async delete(id: string): Promise<boolean> { return true; }
}