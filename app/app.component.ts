import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Importación vital

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Solo necesitamos el RouterOutlet aquí
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent { }