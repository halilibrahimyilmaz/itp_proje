import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { environment } from '../environments/environment';

// Initialize Firebase
export const app = initializeApp(environment.firebase);
export const database = getDatabase(app); 