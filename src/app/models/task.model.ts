import firebase from 'firebase/compat/app';

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}