import { Injectable } from '@angular/core';
import { Database, ref, set, get, query, orderByChild, equalTo, remove, push, onValue } from '@angular/fire/database';
import { Auth, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, tap, catchError, throwError } from 'rxjs';
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
    this.loadTasks();
  }

  private loadTasks() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        const tasksRef = ref(this.db, 'tasks');
        const tasksQuery = query(tasksRef, orderByChild('userId'), equalTo(user.uid));
        
        onValue(tasksQuery, (snapshot) => {
          const tasks: Task[] = [];
          snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            tasks.push({
              id: childSnapshot.key!,
              title: data.title,
              description: data.description,
              categoryId: data.categoryId,
              dueDate: data.dueDate,
              priority: data.priority,
              completed: data.completed || false,
              userId: data.userId,
              createdAt: new Date(data.createdAt),
              updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
            });
          });
          this.tasksSubject.next(tasks);
        }, (error) => {
          console.error('Görevler yüklenirken hata:', error);
          this.tasksSubject.next([]);
        });
      } else {
        this.tasksSubject.next([]);
      }
    });
  }

  getTask(id: string): Observable<Task | undefined> {
    return new Observable(observer => {
      try {
        const taskRef = ref(this.db, `tasks/${id}`);
        get(taskRef).then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const task: Task = {
              id: snapshot.key!,
              title: data.title,
              description: data.description,
              categoryId: data.categoryId,
              dueDate: data.dueDate,
              priority: data.priority,
              completed: data.completed || false,
              userId: data.userId,
              createdAt: new Date(data.createdAt),
              updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
            };
            observer.next(task);
          } else {
            observer.next(undefined);
          }
          observer.complete();
        }).catch(error => {
          console.error('Görev getirilirken hata:', error);
          observer.error(error);
        });
      } catch (error) {
        console.error('Görev getirilirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }

  createTask(task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<void> {
    return new Observable(observer => {
      const user = this.auth.currentUser;
      if (!user) {
        observer.error(new Error('Kullanıcı oturum açmamış'));
        return;
      }

      try {
        const tasksRef = ref(this.db, 'tasks');
        const newTaskRef = push(tasksRef);
        const now = new Date();
        const newTask: Task = {
          ...task,
          id: newTaskRef.key!,
          userId: user.uid,
          createdAt: now,
          updatedAt: now,
          completed: false
        };

        set(newTaskRef, newTask)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(error => {
            console.error('Görev eklenirken hata:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('Görev eklenirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }

  updateTask(id: string, task: Partial<Task>): Observable<void> {
    return new Observable(observer => {
      try {
        const taskRef = ref(this.db, `tasks/${id}`);
        const now = new Date();
        const updatedTask = {
          ...task,
          updatedAt: now
        };

        set(taskRef, updatedTask)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(error => {
            console.error('Görev güncellenirken hata:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('Görev güncellenirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }

  deleteTask(id: string): Observable<void> {
    return new Observable(observer => {
      try {
        const taskRef = ref(this.db, `tasks/${id}`);
        remove(taskRef)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(error => {
            console.error('Görev silinirken hata:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('Görev silinirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }

  toggleTaskCompletion(id: string, completed: boolean): Observable<void> {
    return new Observable(observer => {
      try {
        const taskRef = ref(this.db, `tasks/${id}`);
        const now = new Date();
        
        // Önce mevcut görevi al
        get(taskRef).then(snapshot => {
          if (snapshot.exists()) {
            const currentTask = snapshot.val();
            const updatedTask = {
              ...currentTask,
              completed: completed,
              updatedAt: now
            };

            // Görevi güncelle
            set(taskRef, updatedTask)
              .then(() => {
                console.log('Görev durumu güncellendi:', id, completed);
                observer.next();
                observer.complete();
              })
              .catch(error => {
                console.error('Görev durumu güncellenirken hata:', error);
                observer.error(error);
              });
          } else {
            observer.error(new Error('Görev bulunamadı'));
          }
        }).catch(error => {
          console.error('Görev getirilirken hata:', error);
          observer.error(error);
        });
      } catch (error) {
        console.error('Görev durumu güncellenirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }
} 