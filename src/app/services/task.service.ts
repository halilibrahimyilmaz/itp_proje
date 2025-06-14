import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        this.tasksSubject.next(JSON.parse(savedTasks));
      }
    }
  }

  private saveTasks(tasks: Task[]): void {
    if (this.isBrowser) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    this.tasksSubject.next(tasks);
  }

  getTasks(): Observable<Task[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return new Observable<Task[]>();
    
    const tasks = this.tasksSubject.value.filter(task => task.userId === user.uid);
    return new Observable(subscriber => {
      subscriber.next(tasks);
      subscriber.complete();
    });
  }

  getTask(id: string): Task | undefined {
    return this.tasksSubject.value.find(task => task.id === id);
  }

  createTask(task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tasks = [...this.tasksSubject.value, newTask];
    this.saveTasks(tasks);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.tasksSubject.value.map(task => {
      if (task.id === id) {
        return { ...task, ...updates, updatedAt: new Date() };
      }
      return task;
    });
    this.saveTasks(tasks);
  }

  deleteTask(id: string): void {
    const tasks = this.tasksSubject.value.filter(task => task.id !== id);
    this.saveTasks(tasks);
  }
} 