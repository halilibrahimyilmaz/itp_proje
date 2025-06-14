import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User as FirebaseUser } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: FirebaseUser | null = null;
  displayName: string = '';
  email: string = '';
  loading: boolean = true;
  error: string = '';
  success: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
      }
      this.loading = false;
    });
  }

  async updateProfile(): Promise<void> {
    if (!this.user) return;

    try {
      this.loading = true;
      this.error = '';
      this.success = '';

      await this.authService.updateProfile(this.displayName);
      this.success = 'Profil başarıyla güncellendi!';
    } catch (error) {
      this.error = 'Profil güncellenirken bir hata oluştu.';
      console.error('Profil güncelleme hatası:', error);
    } finally {
      this.loading = false;
    }
  }
} 