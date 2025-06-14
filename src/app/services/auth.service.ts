import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User as FirebaseUser, 
  onAuthStateChanged, 
  browserLocalPersistence,
  getAuth,
  initializeAuth
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { app } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private auth: Auth;

  constructor(private router: Router) {
    // Initialize Firebase Auth with browser persistence
    this.auth = initializeAuth(app, {
      persistence: browserLocalPersistence
    });

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      if (user) {
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      console.log('Login successful for:', user.email);
      this.currentUserSubject.next(user);
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      console.log('Attempting registration for:', email);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, { displayName });
      console.log('Registration successful for:', user.email);
      
      this.currentUserSubject.next(user);
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

  async updateProfile(displayName: string): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName });
        this.currentUserSubject.next(user);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
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
        return 'Şifre en az 6 karakter olmalıdır.';
      case 'auth/operation-not-allowed':
        return 'E-posta/şifre girişi etkin değil.';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      case 'auth/invalid-credential':
        return 'Geçersiz e-posta veya şifre.';
      default:
        return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    }
  }
} 