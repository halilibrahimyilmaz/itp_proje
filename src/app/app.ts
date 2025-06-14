import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/layout/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="container mt-4">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'gorevlerim';
}
