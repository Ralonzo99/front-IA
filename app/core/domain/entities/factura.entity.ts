export interface Factura {
  id: string;
  numero: string;
  fechaEmision: Date | string;
  estado: string;
  // Campos técnicos del backend de tu compañero
  claveAcceso?: string;
  iat?: number;
  exp?: number;
  
  emisor: {
    ruc: string;
    nombre: string;
  };
  receptor: {
    nombre: string;
  };
  numeroAutorizacion?: string;
  pdfBase64?: string; // Vital para el visor
}