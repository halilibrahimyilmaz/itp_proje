import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
                    placeholder="Adınızı ve soyadınızı girin"
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
                    placeholder="E-posta adresinizi girin"
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
                    placeholder="Şifrenizi girin"
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
                    placeholder="Şifrenizi tekrar girin"
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
      border: none;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    .card-body {
      padding: 2rem;
    }

    .card-title {
      color: #333;
      font-weight: 600;
    }

    .form-label {
      font-weight: 500;
      color: #555;
    }

    .form-control {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 0.75rem;
    }

    .form-control:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .btn-primary {
      background-color: #007bff;
      border: none;
      padding: 0.75rem;
      font-weight: 500;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #ccc;
    }

    .alert-danger {
      background-color: #fff5f5;
      border: none;
      color: #dc3545;
      padding: 1rem;
      border-radius: 5px;
    }

    .text-danger small {
      display: block;
      margin-top: 0.25rem;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent implements OnInit {
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

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/tasks']);
      }
    });
  }

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