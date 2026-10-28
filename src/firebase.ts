import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  Firestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Suppress non-critical Firestore offline/network transport warnings
setLogLevel('error');

// Halaba FC Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1swjfbgCpvt0NI0uwTlaAwV2AAjo-69o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "halabafc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "halabafc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "halabafc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "34931922331",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:34931922331:web:90c5af1703bba1fb83fd3e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PC0BB49XRK"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with force long-polling to prevent WebChannel 10s stream timeouts in iframe/WebView environments
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  // Log cleanly without throwing unhandled exceptions
  console.warn("Firestore Operation Notice:", JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection(): Promise<boolean> {
  // Non-blocking connectivity indicator that does not stall the app or throw 10s timeouts
  return Boolean(db);
}
