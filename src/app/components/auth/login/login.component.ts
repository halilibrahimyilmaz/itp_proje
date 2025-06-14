import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Giriş Yap</h2>
              
              <div *ngIf="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>

              <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
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

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
                    {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
                  </button>
                </div>
              </form>

              <div class="text-center mt-3">
                <p>Hesabınız yok mu? <a routerLink="/register">Kayıt Ol</a></p>
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
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Eğer kullanıcı zaten giriş yapmışsa tasks sayfasına yönlendir
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/tasks']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        await this.authService.login(this.email, this.password);
        this.router.navigate(['/tasks']);
      } catch (error: any) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
} 