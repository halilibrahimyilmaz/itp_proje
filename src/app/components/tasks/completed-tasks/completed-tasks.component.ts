import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { CategoryService } from '../../../services/category.service';
import { Task } from '../../../models/task.model';
import { Category } from '../../../models/category.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-completed-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="row mb-4">
        <div class="col">
          <h2>Tamamlanan Görevler</h2>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div *ngIf="loading" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Yükleniyor...</span>
            </div>
          </div>

          <div *ngIf="!loading && !filteredTasks.length" class="alert alert-info">
            Henüz tamamlanan görev bulunmuyor.
          </div>

          <div *ngIf="!loading && filteredTasks.length" class="list-group">
            <div *ngFor="let task of filteredTasks" class="list-group-item">
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1 text-decoration-line-through">{{ task.title }}</h5>
                  <p class="mb-1">{{ task.description }}</p>
                  <small class="text-muted">
                    Kategori: {{ getCategoryName(task.categoryId) }}
                    <br>
                    Tamamlanma: {{ task.updatedAt ? (task.updatedAt | date:'dd/MM/yyyy HH:mm') : (task.createdAt | date:'dd/MM/yyyy HH:mm') }}
                  </small>
                </div>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary me-2" (click)="toggleTaskCompletion(task)">
                    <i class="bi bi-arrow-counterclockwise"></i> Geri Al
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteTask(task)">
                    <i class="bi bi-trash"></i> Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-group-item {
      transition: all 0.3s ease;
      border-radius: 8px !important;
      margin-bottom: 10px;
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .list-group-item:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .btn-group .btn {
      padding: 0.4rem 0.8rem;
      transition: all 0.3s ease;
      border-radius: 6px !important;
      margin: 0 2px;
    }
    .btn-group .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .btn-outline-primary {
      border-color: #0d6efd;
      color: #0d6efd;
    }
    .btn-outline-primary:hover {
      background-color: #0d6efd;
      color: white;
    }
    .btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
      color: white;
    }
    .btn-danger:hover {
      background-color: #bb2d3b;
      border-color: #b02a37;
    }
    .btn-outline-primary .bi,
    .btn-danger .bi {
      margin-right: 4px;
    }
    h2 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .text-muted {
      color: #6c757d !important;
      font-size: 0.9rem;
    }
    .alert {
      border-radius: 8px;
      padding: 1rem;
    }
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class CompletedTasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.taskService.tasks$.subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.loading = false;
        },
        error: (error) => {
          console.error('Görevler yüklenirken hata:', error);
          this.loading = false;
        }
      })
    );

    this.subscription.add(
      this.categoryService.categories$.subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Kategoriler yüklenirken hata:', error);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => task.completed);
  }

  getCategoryName(categoryId: string): string {
    if (!categoryId) {
      return 'Kategorisiz';
    }
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Kategorisiz';
  }

  toggleTaskCompletion(task: Task) {
    this.taskService.toggleTaskCompletion(task.id, false).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      },
      error: (error) => {
        console.error('Görev durumu güncellenirken hata:', error);
        alert('Görev durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    });
  }

  deleteTask(task: Task) {
    if (confirm(`"${task.title}" görevini silmek istediğinizden emin misiniz?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        error: (error) => {
          console.error('Görev silinirken hata:', error);
          alert('Görev silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      });
    }
  }
} 