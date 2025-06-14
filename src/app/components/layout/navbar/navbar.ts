import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  user$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
