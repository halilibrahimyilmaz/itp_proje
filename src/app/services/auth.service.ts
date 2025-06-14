import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User as FirebaseUser } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Firebase auth state değişikliklerini dinle
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserSubject.next({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      this.currentUserSubject.next({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });
      
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Kullanıcı profilini güncelle
      await updateProfile(user, { displayName });
      
      this.currentUserSubject.next({
        uid: user.uid,
        email: user.email,
        displayName: displayName
      });
      
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-disabled':
        return 'Bu kullanıcı hesabı devre dışı bırakılmış.';
      case 'auth/user-not-found':
        return 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Hatalı şifre.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf.';
      case 'auth/operation-not-allowed':
        return 'E-posta/şifre girişi etkin değil.';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      default:
        return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    }
  }
} 