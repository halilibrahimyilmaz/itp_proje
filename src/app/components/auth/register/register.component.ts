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
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Kayıt Ol</h2>
              
              <div *ngIf="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>

              <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
                <div class="mb-3">
                  <label for="displayName" class="form-label">Ad Soyad</label>
                  <input
                    type="text"
                    class="form-control"
                    id="displayName"
                    name="displayName"
                    [(ngModel)]="displayName"
                    required
                    minlength="2"
                    #displayNameInput="ngModel"
                  >
                  <div *ngIf="displayNameInput.invalid && (displayNameInput.dirty || displayNameInput.touched)" class="text-danger">
                    <small *ngIf="displayNameInput.errors?.['required']">Ad Soyad gerekli.</small>
                    <small *ngIf="displayNameInput.errors?.['minlength']">Ad Soyad en az 2 karakter olmalıdır.</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">E-posta</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    name="email"
                    [(ngModel)]="email"
                    required
                    email
                    #emailInput="ngModel"
                  >
                  <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)" class="text-danger">
                    <small *ngIf="emailInput.errors?.['required']">E-posta adresi gerekli.</small>
                    <small *ngIf="emailInput.errors?.['email']">Geçerli bir e-posta adresi girin.</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Şifre</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    name="password"
                    [(ngModel)]="password"
                    required
                    minlength="6"
                    #passwordInput="ngModel"
                  >
                  <div *ngIf="passwordInput.invalid && (passwordInput.dirty || passwordInput.touched)" class="text-danger">
                    <small *ngIf="passwordInput.errors?.['required']">Şifre gerekli.</small>
                    <small *ngIf="passwordInput.errors?.['minlength']">Şifre en az 6 karakter olmalıdır.</small>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Şifre Tekrar</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    [(ngModel)]="confirmPassword"
                    required
                    #confirmPasswordInput="ngModel"
                  >
                  <div *ngIf="confirmPasswordInput.invalid && (confirmPasswordInput.dirty || confirmPasswordInput.touched)" class="text-danger">
                    <small *ngIf="confirmPasswordInput.errors?.['required']">Şifre tekrarı gerekli.</small>
                    <small *ngIf="password !== confirmPassword">Şifreler eşleşmiyor.</small>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || isLoading || password !== confirmPassword">
                    {{ isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}
                  </button>
                </div>
              </form>

              <div class="text-center mt-3">
                <p>Zaten hesabınız var mı? <a routerLink="/login">Giriş Yap</a></p>
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
    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
    }
    .btn-primary:hover {
      background-color: #0056b3;
      border-color: #0056b3;
    }
  `]
})
export class RegisterComponent {
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (this.displayName && this.email && this.password && this.password === this.confirmPassword) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        await this.authService.register(this.email, this.password, this.displayName);
        this.router.navigate(['/tasks']);
      } catch (error: any) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
} 