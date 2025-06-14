import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/completed',
    loadComponent: () => import('./components/tasks/completed-tasks/completed-tasks.component').then(m => m.CompletedTasksComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/add',
    loadComponent: () => import('./components/tasks/task-form/task-form').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () => import('./components/tasks/task-form/task-form').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/categories/category-list/category-list.component').then(m => m.CategoryListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  }
];
