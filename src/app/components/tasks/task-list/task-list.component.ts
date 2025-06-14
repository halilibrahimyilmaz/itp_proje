import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { CategoryService } from '../../../services/category.service';
import { Task } from '../../../models/task.model';
import { Category } from '../../../models/category.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.component.html',
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
    }
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .list-group-item.active {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    .list-group-item.active .text-muted {
      color: rgba(255, 255, 255, 0.8) !important;
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
    .mb-1 {
      margin-bottom: 0.5rem !important;
    }
    .alert {
      border-radius: 8px;
      padding: 1rem;
    }
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
    .dropdown-menu {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid rgba(0,0,0,0.1);
    }
    .dropdown-item {
      padding: 0.5rem 1rem;
      transition: all 0.2s ease;
    }
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    .badge {
      font-weight: 500;
      padding: 0.35em 0.65em;
    }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  selectedCategory: string | null = null;
  showAddTaskModal = false;
  showEditModal = false;
  editingTask: Task | null = null;
  newCategory = { id: '', name: '', userId: '', createdAt: new Date() };
  newTask = {
    title: '',
    description: '',
    categoryId: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    completed: false,
    userId: '',
    createdAt: new Date()
  };
  private subscription: Subscription | undefined;
  private sortByCategory = false;
  private categoryModal: any;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.subscription = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.loading = false;
    });

    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });

    // Initialize Bootstrap modal
    const modalElement = document.getElementById('addCategoryModal');
    if (modalElement) {
      this.categoryModal = new bootstrap.Modal(modalElement);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.categoryModal) {
      this.categoryModal.dispose();
    }
  }

  get filteredTasks(): Task[] {
    let tasks = this.tasks.filter(task => !task.completed); // Sadece tamamlanmamış görevleri al
    
    // Kategori filtresi
    if (this.selectedCategory) {
      tasks = tasks.filter(task => task.categoryId === this.selectedCategory);
    }

    // Kategoriye göre sıralama
    if (this.sortByCategory) {
      tasks = [...tasks].sort((a, b) => {
        const categoryA = this.getCategoryName(a.categoryId);
        const categoryB = this.getCategoryName(b.categoryId);
        return categoryA.localeCompare(categoryB);
      });
    }

    return tasks;
  }

  toggleSort() {
    this.sortByCategory = !this.sortByCategory;
  }

  getSortIcon(): string {
    return this.sortByCategory ? 'bi-sort-alpha-down' : 'bi-sort-alpha-down-alt';
  }

  getTaskCountByCategory(categoryId: string | null): number {
    if (categoryId === null) {
      return this.tasks.filter(task => !task.completed).length;
    }
    return this.tasks.filter(task => !task.completed && task.categoryId === categoryId).length;
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

  toggleTaskCompletion(task: Task) {
    this.taskService.toggleTaskCompletion(task.id, true).subscribe({
      next: () => {
        // Remove the task from the current list
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      },
      error: (error) => {
        console.error('Görev tamamlanırken hata oluştu:', error);
      }
    });
  }

  editTask(task: Task) {
    this.editingTask = { ...task };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTask = null;
  }

  updateTask() {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, this.editingTask).subscribe({
        next: () => {
          this.closeEditModal();
        },
        error: (error) => {
          console.error('Görev güncellenirken hata oluştu:', error);
        }
      });
    }
  }

  deleteTask(task: Task) {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      this.taskService.deleteTask(task.id).subscribe();
    }
  }

  createTask() {
    if (this.newTask.title.trim()) {
      this.taskService.createTask(this.newTask).subscribe({
        next: () => {
          this.closeAddTaskModal();
        },
        error: (error) => {
          console.error('Görev oluşturulurken hata oluştu:', error);
        }
      });
    }
  }

  closeAddTaskModal() {
    this.showAddTaskModal = false;
    this.newTask = {
      title: '',
      description: '',
      categoryId: '',
      dueDate: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      completed: false,
      userId: '',
      createdAt: new Date()
    };
  }

  showAddCategoryModal() {
    this.newCategory = { id: '', name: '', userId: '', createdAt: new Date() };
    if (this.categoryModal) {
      this.categoryModal.show();
    }
  }

  closeAddCategoryModal() {
    if (this.categoryModal) {
      this.categoryModal.hide();
    }
    this.newCategory = { id: '', name: '', userId: '', createdAt: new Date() };
  }

  addCategory() {
    if (this.newCategory.name.trim()) {
      const category: Category = {
        id: '',
        name: this.newCategory.name.trim(),
        userId: '',
        createdAt: new Date()
      };
      
      this.categoryService.addCategory(category).subscribe({
        next: () => {
          this.closeAddCategoryModal();
        },
        error: (error) => {
          console.error('Kategori eklenirken hata oluştu:', error);
          alert('Kategori eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      });
    }
  }

  deleteCategory(category: Category) {
    const taskCount = this.getTaskCountByCategory(category.id);
    const message = taskCount > 0
      ? `"${category.name}" kategorisini silmek istediğinizden emin misiniz? Bu kategoride ${taskCount} görev bulunmaktadır. Bu görevler kategorisiz olarak işaretlenecektir.`
      : `"${category.name}" kategorisini silmek istediğinizden emin misiniz?`;

    if (confirm(message)) {
      // First, update all tasks in this category to have no category
      const tasksToUpdate = this.tasks.filter(task => task.categoryId === category.id);
      const updatePromises = tasksToUpdate.map(task => {
        return this.taskService.updateTask(task.id, { ...task, categoryId: '' }).toPromise();
      });

      Promise.all(updatePromises)
        .then(() => {
          // Then delete the category
          this.categoryService.deleteCategory(category.id).subscribe({
            error: (error) => {
              console.error('Kategori silinirken hata oluştu:', error);
            }
          });
        })
        .catch(error => {
          console.error('Görevler güncellenirken hata oluştu:', error);
        });
    }
  }
} 