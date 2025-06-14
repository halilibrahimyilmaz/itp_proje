import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { TaskListComponent } from './components/tasks/task-list/task-list';
import { TaskFormComponent } from './components/tasks/task-form/task-form';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'tasks', 
    component: TaskListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks/new', 
    component: TaskFormComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks/edit/:id', 
    component: TaskFormComponent,
    canActivate: [AuthGuard]
  }
];
