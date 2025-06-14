import { Injectable } from '@angular/core';
import { Database, ref, set, get, query, orderByChild, equalTo, remove, push, onValue } from '@angular/fire/database';
import { Auth, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, tap, catchError, throwError } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(
    private db: Database,
    private auth: Auth
  ) {
    this.loadCategories();
  }

  private loadCategories() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        const categoriesRef = ref(this.db, 'categories');
        const categoriesQuery = query(categoriesRef, orderByChild('userId'), equalTo(user.uid));
        
        // Gerçek zamanlı dinleme ekle
        onValue(categoriesQuery, (snapshot) => {
          const categories: Category[] = [];
          snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            categories.push({
              id: childSnapshot.key!,
              name: data.name,
              userId: data.userId,
              createdAt: new Date(data.createdAt)
            });
          });
          this.categoriesSubject.next(categories);
        }, (error) => {
          console.error('Kategoriler yüklenirken hata:', error);
          this.categoriesSubject.next([]);
        });
      } else {
        this.categoriesSubject.next([]);
      }
    });
  }

  addCategory(category: Category): Observable<void> {
    return new Observable(observer => {
      const user = this.auth.currentUser;
      if (!user) {
        observer.error(new Error('Kullanıcı oturum açmamış'));
        return;
      }

      try {
        const categoriesRef = ref(this.db, 'categories');
        const newCategoryRef = push(categoriesRef);
        const newCategory: Category = {
          ...category,
          id: newCategoryRef.key!,
          userId: user.uid,
          createdAt: new Date()
        };

        set(newCategoryRef, newCategory)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(error => {
            console.error('Kategori eklenirken hata:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('Kategori eklenirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }

  deleteCategory(id: string): Observable<void> {
    return new Observable(observer => {
      try {
        const categoryRef = ref(this.db, `categories/${id}`);
        remove(categoryRef)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(error => {
            console.error('Kategori silinirken hata:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('Kategori silinirken beklenmeyen hata:', error);
        observer.error(error);
      }
    });
  }
} 