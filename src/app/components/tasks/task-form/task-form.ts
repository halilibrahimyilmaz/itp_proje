import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { Task } from '../../../models/task.model';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">{{ isEditMode ? 'Görevi Düzenle' : 'Yeni Görev' }}</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="title" class="form-label">Başlık</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    formControlName="title"
                    [class.is-invalid]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="taskForm.get('title')?.errors?.['required']">
                    Başlık zorunludur
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Açıklama</label>
                  <textarea
                    class="form-control"
                    id="description"
                    rows="3"
                    formControlName="description"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="category" class="form-label">Kategori</label>
                  <select
                    class="form-select"
                    id="category"
                    formControlName="categoryId"
                    [class.is-invalid]="taskForm.get('categoryId')?.invalid && taskForm.get('categoryId')?.touched"
                  >
                    <option value="">Kategori Seçin</option>
                    <option *ngFor="let category of categories" [value]="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                  <div class="invalid-feedback" *ngIf="taskForm.get('categoryId')?.errors?.['required']">
                    Kategori seçimi zorunludur
                  </div>
                </div>

                <div class="mb-3">
                  <label for="dueDate" class="form-label">Bitiş Tarihi</label>
                  <input
                    type="date"
                    class="form-control"
                    id="dueDate"
                    formControlName="dueDate"
                    [class.is-invalid]="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="taskForm.get('dueDate')?.errors?.['required']">
                    Bitiş tarihi zorunludur
                  </div>
                </div>

                <div class="mb-3">
                  <label for="priority" class="form-label">Öncelik</label>
                  <select
                    class="form-select"
                    id="priority"
                    formControlName="priority"
                    [class.is-invalid]="taskForm.get('priority')?.invalid && taskForm.get('priority')?.touched"
                  >
                    <option value="">Öncelik Seçin</option>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="taskForm.get('priority')?.errors?.['required']">
                    Öncelik seçimi zorunludur
                  </div>
                </div>

                <div class="d-flex justify-content-between">
                  <button type="button" class="btn btn-secondary" (click)="goBack()">
                    <i class="bi bi-arrow-left"></i> Geri
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">
                    <i class="bi" [class.bi-save]="!isEditMode" [class.bi-pencil]="isEditMode"></i>
                    {{ isEditMode ? 'Güncelle' : 'Kaydet' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    .form-label {
      font-weight: 500;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn i {
      font-size: 1.1rem;
    }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: string | null = null;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      categoryId: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Kategorileri yükle
    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });

    // Task ID'sini al
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.taskId;

    if (this.isEditMode && this.taskId) {
      // Düzenleme modunda task'ı yükle
      this.taskService.getTask(this.taskId).subscribe(task => {
        if (task) {
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            categoryId: task.categoryId,
            dueDate: task.dueDate,
            priority: task.priority
          });
        }
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      
      if (this.isEditMode && this.taskId) {
        // Güncelleme
        this.taskService.updateTask(this.taskId, taskData).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Görev güncellenirken hata oluştu:', error);
          }
        });
      } else {
        // Yeni görev oluşturma
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Görev oluşturulurken hata oluştu:', error);
          }
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
