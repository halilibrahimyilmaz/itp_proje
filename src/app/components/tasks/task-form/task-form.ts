import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      completed: [false]
    });
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEditMode = true;
      const task = this.taskService.getTask(this.taskId);
      if (task) {
        this.taskForm.patchValue(task);
      } else {
        this.router.navigate(['/tasks']);
      }
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, this.taskForm.value);
      } else {
        this.taskService.createTask(this.taskForm.value);
      }
      this.router.navigate(['/tasks']);
    }
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
}
