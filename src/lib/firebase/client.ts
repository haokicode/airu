import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasClientConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!hasClientConfig()) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

const app = getFirebaseClientApp();

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export async function getFirebaseMessaging() {
  if (!app || typeof window === "undefined" || !(await isSupported())) {
    return null;
  }

  return getMessaging(app);
}
