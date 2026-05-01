import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// .env 파일에서 환경변수를 불러와 Firebase 설정 객체를 구성합니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const APP_ID = 'rog-card-default';
export const USERS_PATH = `artifacts/${APP_ID}/public/data/users`;
export const CARDS_PATH = `artifacts/${APP_ID}/public/data/cards`;
export const MATCHES_PATH = `artifacts/${APP_ID}/public/data/matches`;
export const GLOBAL_CHAT_PATH = `artifacts/${APP_ID}/public/data/globalChat`;