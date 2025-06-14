import { Injectable } from '@angular/core';
import { Database, ref, set, get, query, orderByChild, equalTo, remove, push } from '@angular/fire/database';
import { Auth, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
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
        
        get(categoriesQuery).then(snapshot => {
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
        });
      } else {
        this.categoriesSubject.next([]);
      }
    });
  }

  addCategory(category: Category): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Kullanıcı oturum açmamış');
    }

    const categoriesRef = ref(this.db, 'categories');
    const newCategoryRef = push(categoriesRef);
    const newCategory: Category = {
      ...category,
      id: newCategoryRef.key!,
      userId: user.uid,
      createdAt: new Date()
    };

    return from(set(newCategoryRef, newCategory)).pipe(
      map(() => this.loadCategories())
    );
  }

  deleteCategory(id: string): Observable<void> {
    const categoryRef = ref(this.db, `categories/${id}`);
    return from(remove(categoryRef)).pipe(
      map(() => this.loadCategories())
    );
  }
} 