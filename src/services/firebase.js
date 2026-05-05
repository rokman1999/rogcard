// Firebase 초기화를 한 파일에 격리하는 이유:
// auth와 db 인스턴스를 싱글턴으로 유지해야 하며,
// 여러 파일에서 import 시 중복 초기화 오류를 방지하기 위함.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayUnion,
  addDoc,
  query,
  where,
  getDocs,
  increment
} from 'firebase/firestore';

// Vite 환경변수 우선, 없으면 하드코딩된 기본값 사용 (로컬 개발 편의성)
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDhI7NY91JVUKNbLUP8wBOSViFOhww8B6g",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "rogcard-5817f.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "rogcard-5817f",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "rogcard-5817f.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "773353426861",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:773353426861:web:f0790795db5459379b1b24"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore 컬렉션 경로를 상수로 관리하는 이유:
// 문자열 오타로 인한 버그를 컴파일 타임에 잡고,
// 경로 변경 시 이 파일 한 곳만 수정하면 전체 반영됨.
const appId = 'rog-card-default';
export const USERS_PATH = `artifacts/${appId}/public/data/users`;
export const CARDS_PATH = `artifacts/${appId}/public/data/cards`;
export const MATCHES_PATH = `artifacts/${appId}/public/data/matches`;
export const GLOBAL_CHAT_PATH = `artifacts/${appId}/public/data/globalChat`;
export const CHALLENGES_PATH = `artifacts/${appId}/public/data/challenges`;

// Firebase 관련 함수들을 재-export해서 사용처에서 firebase/firestore를 직접 import하지 않아도 되게 함
export {
  collection, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteDoc,
  arrayUnion, addDoc, query, where, getDocs, increment,
  signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword
};
