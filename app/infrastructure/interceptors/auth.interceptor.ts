import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token_jwt');
  // La Key de tu compañero decodificada o como string
  const apiKey = 'MDRmZGY4NzM3MzU5M2M1YzkwNzVkYTMxMGE5YTIxN2QzNzU0YTAwZjI1NWY1MTdkNDczZmVjMTE1YzNkYTg4Yg==';

  // Clonamos la petición para añadir la API Key y el Token
  const authReq = req.clone({
    setHeaders: {
      'x-api-key': apiKey, // Ajusta el nombre del header si tu compañero usa otro
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  return next(authReq);
};