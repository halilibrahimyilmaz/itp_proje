import { Injectable } from '@angular/core';
import { Database, ref, set, get, query, orderByChild, equalTo, remove, update, push, onValue } from '@angular/fire/database';
import { Auth, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, map, switchMap, tap } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(
    private db: Database,
    private auth: Auth
  ) {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User authenticated, loading tasks...');
        this.loadTasks(user);
      } else {
        console.log('No user authenticated, clearing tasks');
        this.tasksSubject.next([]);
      }
    });
  }

  private loadTasks(user: User) {
    try {
      console.log('Loading tasks for user:', user.uid);
      const tasksRef = ref(this.db, 'tasks');
      const tasksQuery = query(tasksRef, orderByChild('userId'), equalTo(user.uid));
      
      onValue(tasksQuery, (snapshot) => {
        console.log('Tasks snapshot received');
        const tasks: Task[] = [];
        snapshot.forEach(childSnapshot => {
          const data = childSnapshot.val();
          tasks.push({
            id: childSnapshot.key!,
            title: data.title,
            description: data.description || '',
            categoryId: data.categoryId || '',
            dueDate: data.dueDate,
            priority: data.priority,
            completed: data.completed || false,
            userId: data.userId,
            createdAt: new Date(data.createdAt),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
          });
        });
        console.log('Loaded tasks:', tasks.length);
        // Sort by creation date (newest first)
        tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        this.tasksSubject.next(tasks);
      }, (error) => {
        console.error('Error loading tasks:', error);
        this.tasksSubject.next([]);
      });
    } catch (error) {
      console.error('Error in loadTasks:', error);
      this.tasksSubject.next([]);
    }
  }

  getTask(id: string): Observable<Task | undefined> {
    const taskRef = ref(this.db, `tasks/${id}`);
    return from(get(taskRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          return {
            id: snapshot.key!,
            title: data.title,
            description: data.description || '',
            categoryId: data.categoryId || '',
            dueDate: data.dueDate,
            priority: data.priority,
            completed: data.completed || false,
            userId: data.userId,
            createdAt: new Date(data.createdAt),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
          } as Task;
        }
        return undefined;
      })
    );
  }

  createTask(taskData: Partial<Task>): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Kullanıcı oturum açmamış');
    }

    const tasksRef = ref(this.db, 'tasks');
    const newTaskRef = push(tasksRef);
    const newTask: Task = {
      id: newTaskRef.key!,
      title: taskData.title!,
      description: taskData.description || '',
      categoryId: taskData.categoryId!,
      dueDate: taskData.dueDate!,
      priority: taskData.priority!,
      completed: false,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: undefined
    };

    return from(set(newTaskRef, newTask));
  }

  updateTask(id: string, taskData: Partial<Task>): Observable<void> {
    const taskRef = ref(this.db, `tasks/${id}`);
    return from(update(taskRef, taskData));
  }

  deleteTask(id: string): Observable<void> {
    const taskRef = ref(this.db, `tasks/${id}`);
    return from(remove(taskRef));
  }

  toggleTaskCompletion(id: string, completed: boolean): Observable<void> {
    console.log('Toggling task completion:', id, completed);
    const taskRef = ref(this.db, `tasks/${id}`);
    const updateData = {
      completed,
      updatedAt: completed ? new Date().toISOString() : null
    };
    return from(update(taskRef, updateData)).pipe(
      tap(() => {
        console.log('Task completion updated in Firebase');
        // Update local state immediately
        const currentTasks = this.tasksSubject.value;
        const updatedTasks = currentTasks.map(task => 
          task.id === id ? { ...task, completed, updatedAt: completed ? new Date() : undefined } : task
        );
        this.tasksSubject.next(updatedTasks);
      })
    );
  }
} 