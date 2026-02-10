import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Ваша конфигурация Firebase (замените на свою)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Функции для работы с задачами
export const tasksAPI = {
  // Получить задачи пользователя
  getTasks: async (userId) => {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Добавить задачу
  addTask: async (taskData) => {
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...taskData };
  },
  
  // Обновить задачу
  updateTask: async (taskId, updates) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },
  
  // Удалить задачу
  deleteTask: async (taskId) => {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  }
};

// Функции для работы со словарём
export const dictionaryAPI = {
  // Получить слова пользователя
  getWords: async (userId) => {
    const wordsRef = collection(db, 'dictionary');
    const q = query(wordsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Добавить слово
  addWord: async (wordData) => {
    const wordsRef = collection(db, 'words');
    const docRef = await addDoc(wordsRef, {
      ...wordData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...wordData };
  },
  
  // Удалить слово
  deleteWord: async (wordId) => {
    const wordRef = doc(db, 'words', wordId);
    await deleteDoc(wordRef);
  }
};

// Функции для работы с пользователем
export const userAPI = {
  // Сохранить/обновить данные пользователя
  saveUserData: async (userId, userData) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Создать нового пользователя
      const docRef = await addDoc(usersRef, {
        userId,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, userId, ...userData };
    } else {
      // Обновить существующего пользователя
      const userDoc = snapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      return { id: userDoc.id, ...userDoc.data(), ...userData };
    }
  },
  
  // Получить данные пользователя
  getUserData: async (userId) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  }
};

// Функции аутентификации
export const authAPI = {
  // Войти через Google
  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },
  
  // Выйти
  signOut: async () => {
    await signOut(auth);
  },
  
  // Слушатель состояния аутентификации
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
  
  // Получить текущего пользователя
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

export { db, auth };