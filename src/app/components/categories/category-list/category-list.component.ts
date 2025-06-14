import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading = true;
  newCategoryName: string = '';
  private subscription: Subscription | undefined;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.subscription = this.categoryService.categories$.subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  showAddCategoryModal(): void {
    const modal = document.getElementById('addCategoryModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const category: Category = {
        id: '',
        name: this.newCategoryName,
        userId: '',
        createdAt: new Date()
      };
      this.categoryService.addCategory(category).subscribe({
        next: () => {
          this.newCategoryName = '';
          const modal = document.getElementById('addCategoryModal');
          if (modal) {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            bsModal.hide();
          }
        },
        error: (error) => {
          console.error('Kategori eklenirken hata oluştu:', error);
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    if (confirm(`"${category.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        error: (error) => {
          console.error('Kategori silinirken hata oluştu:', error);
        }
      });
    }
  }
} 