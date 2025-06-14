import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { CategoryService } from '../../../services/category.service';
import { Task } from '../../../models/task.model';
import { Category } from '../../../models/category.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-completed-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './completed-tasks.component.html',
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
      text-align: center;
    }
    .col {
      width: 100%;
      padding: 0 1rem;
    }
    .list-group-item {
      transition: all 0.2s ease;
      border-radius: 8px !important;
      margin-bottom: 10px;
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      background-color: #ffffff;
      padding: 1rem;
    }
    .list-group-item:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .btn-group .btn {
      padding: 0.4rem 0.8rem;
      transition: all 0.2s ease;
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
    .btn-outline-success {
      border-color: #198754;
      color: #198754;
    }
    .btn-outline-success:hover {
      background-color: #198754;
      color: white;
    }
    .btn-outline-success.btn-success {
      background-color: #198754;
      color: white;
    }
    .btn-outline-danger {
      border-color: #dc3545;
      color: #dc3545;
    }
    .btn-outline-danger:hover {
      background-color: #dc3545;
      color: white;
    }
    .btn-outline-success .bi,
    .btn-outline-primary .bi,
    .btn-outline-danger .bi {
      margin-right: 4px;
      font-size: 1rem;
    }
    h2 {
      color: #ffffff;
      font-weight: 600;
      font-size: 1.75rem;
      background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
      display: block;
      margin: 0 auto 1.5rem;
      text-align: center;
      width: 100%;
    }
    .text-muted {
      color: #6c757d !important;
      font-size: 0.9rem;
    }
    .alert {
      border-radius: 8px;
      padding: 1rem;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      max-width: 800px;
      margin: 1rem auto;
      text-align: center;
    }
    .spinner-border {
      width: 3rem;
      height: 3rem;
      margin: 1.5rem auto;
      display: block;
    }
    .dropdown-menu {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid rgba(0,0,0,0.1);
      padding: 0.5rem;
    }
    .dropdown-item {
      padding: 0.5rem 1rem;
      transition: all 0.2s ease;
      border-radius: 6px;
      margin: 2px 0;
    }
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    .badge {
      font-weight: 500;
      padding: 0.35em 0.65em;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .text-decoration-line-through {
      color: #6c757d;
      opacity: 0.8;
    }
    .btn-group {
      display: flex;
      gap: 4px;
    }
    .btn-group .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
    }
    .btn-group .btn i {
      font-size: 1rem;
    }
    .list-group-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .list-group-item .task-info {
      flex: 1;
      margin-right: 1rem;
    }
    .list-group-item .task-actions {
      display: flex;
      align-items: center;
    }
    .badge.bg-primary {
      background-color: #0d6efd !important;
    }
    .badge.bg-success {
      background-color: #198754 !important;
    }
    .badge.bg-danger {
      background-color: #dc3545 !important;
    }
    .badge.bg-warning {
      background-color: #ffc107 !important;
      color: #000;
    }
    .badge.bg-info {
      background-color: #0dcaf0 !important;
    }
    .badge.bg-secondary {
      background-color: #6c757d !important;
    }
    .dropdown-menu {
      min-width: 200px;
    }
    .dropdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dropdown-item .badge {
      margin-left: 8px;
      font-size: 0.8rem;
    }
    .dropdown-divider {
      margin: 0.5rem 0;
    }
    .task-title {
      font-size: 1rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 0.5rem;
    }
    .task-description {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .task-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .task-meta .badge {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .task-meta .badge i {
      font-size: 0.85rem;
    }
    .filters {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .dropdown {
      display: inline-block;
    }
    .btn-outline-secondary {
      padding: 0.4rem 1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-color: #6c757d;
      color: #6c757d;
    }
    .btn-outline-secondary:hover {
      background-color: #6c757d;
      color: white;
    }
    .btn-outline-secondary i {
      font-size: 1rem;
    }
    .navbar {
      padding: 0.5rem 1rem;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      margin-bottom: 1.5rem;
    }
    .navbar-brand {
      font-weight: 600;
      color: #0d6efd;
      font-size: 1.25rem;
      padding: 0.5rem 0;
    }
    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .nav-link {
      color: #6c757d;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-weight: 500;
    }
    .nav-link:hover {
      color: #0d6efd;
      background-color: #f8f9fa;
    }
    .nav-link.active {
      color: #0d6efd;
      background-color: #e9ecef;
    }
    .navbar-toggler {
      padding: 0.5rem;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 6px;
    }
    .navbar-toggler:focus {
      box-shadow: none;
      outline: none;
    }
    .navbar-toggler-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    @media (max-width: 768px) {
      .navbar-nav {
        padding: 1rem 0;
      }
      .nav-link {
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class CompletedTasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  selectedCategory: string | null = null;
  private subscription: Subscription | undefined;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.subscription = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks.filter(task => task.completed);
      this.loading = false;
    });

    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get filteredTasks(): Task[] {
    let tasks = this.tasks;
    
    // Kategori filtresi
    if (this.selectedCategory) {
      tasks = tasks.filter(task => task.categoryId === this.selectedCategory);
    }

    return tasks;
  }

  selectCategory(categoryId: string | null) {
    this.selectedCategory = categoryId;
  }

  getCategoryName(categoryId: string): string {
    if (!categoryId) {
      return 'Kategorisiz';
    }
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Kategorisiz';
  }

  getTaskCountByCategory(categoryId: string): number {
    return this.tasks.filter(task => task.categoryId === categoryId).length;
  }

  toggleTaskCompletion(task: Task) {
    this.taskService.toggleTaskCompletion(task.id, false).subscribe({
      next: () => {
        // Remove the task from the current list
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      },
      error: (error) => {
        console.error('Görev durumu güncellenirken hata oluştu:', error);
      }
    });
  }

  deleteTask(task: Task) {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          // Remove the task from the current list
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        error: (error) => {
          console.error('Görev silinirken hata oluştu:', error);
        }
      });
    }
  }
} 