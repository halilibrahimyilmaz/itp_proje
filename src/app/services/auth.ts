import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<void> {
    // TODO: Implement actual Firebase authentication
    const mockUser: User = {
      uid: '1',
      email: email,
      displayName: email.split('@')[0]
    };
    
    this.currentUserSubject.next(mockUser);
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    }
  }

  async register(email: string, password: string): Promise<void> {
    // TODO: Implement actual Firebase registration
    await this.login(email, password);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }
}
