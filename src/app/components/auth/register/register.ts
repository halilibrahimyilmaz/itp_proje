import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card mt-5">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Register</h2>
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="email"
                    name="email"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    [(ngModel)]="password"
                    name="password"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    required
                  >
                </div>
                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <button type="submit" class="btn btn-primary w-100">Register</button>
              </form>
              <div class="text-center mt-3">
                <a routerLink="/login">Already have an account? Login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
  `]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/tasks']);
    } catch (error) {
      this.error = 'Registration failed. Please try again.';
    }
  }
}
