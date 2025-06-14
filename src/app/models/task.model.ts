import firebase from 'firebase/compat/app';
export interface Task {
  id?: string; // Firestore tarafından otomatik atanacak ID
  title: string;
  description?: string; // İsteğe bağlı açıklama
  completed: boolean;
  createdAt?: firebase.firestore.FieldValue; // Firestore sunucu zaman damgası
  userId: string; // Bu görevin hangi kullanıcıya ait olduğu
  category?: string; // İsteğe bağlı kategori
}