import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; // Añadido withFetch
import { routes } from './app.routes';

// Interceptor y Adaptadores
import { authInterceptor } from './infrastructure/interceptors/auth.interceptor';
import { FacturaHttpAdapter } from './infrastructure/adapters/factura-http.adapter';
import { PdfHtmlAdapter } from './infrastructure/adapters/pdf-html.adapter';

// EXPORTACIÓN CRÍTICA DE TOKENS PARA INYECCIÓN DE DEPENDENCIAS
export const FACTURA_REPOSITORY_TOKEN = 'FacturaRepositoryPort';
export const PDF_GENERATOR_TOKEN = 'PdfGeneratorPort';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // Configuración moderna de HttpClient
    provideHttpClient(
      withFetch(), // Elimina el warning NG02801 y mejora el rendimiento en SSR
      withInterceptors([]) // Interceptor de autenticación deshabilitado para modo demo
    ),

    // Inyección de dependencias (Arquitectura Hexagonal)
    // Vinculamos los Puertos (Interfaces) con los Adaptadores (Implementaciones)
    { 
      provide: FACTURA_REPOSITORY_TOKEN, 
      useClass: FacturaHttpAdapter 
    },
    { 
      provide: PDF_GENERATOR_TOKEN, 
      useClass: PdfHtmlAdapter 
    }
  ]
};  