import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let cachedApp: App | null | undefined;

function normalizePrivateKey(privateKey: string | undefined) {
  if (!privateKey) return undefined;
  // Remove wrapping quotes if they exist
  let key = privateKey.trim();
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.substring(1, key.length - 1);
  }
  return key.replace(/\\n/g, "\n");
}

function cleanEnvValue(value: string | undefined) {
  if (!value) return undefined;
  let v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

function getProjectId() {
  return (
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT
  );
}

export function getAdminApp(): App | null {
  if (cachedApp !== undefined) {
    return cachedApp;
  }

  const existingApp = getApps()[0];
  if (existingApp) {
    cachedApp = existingApp;
    return cachedApp;
  }

  const projectId = cleanEnvValue(getProjectId());
  const clientEmail = cleanEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  try {
    if (projectId && clientEmail && privateKey) {
      cachedApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      });
      return cachedApp;
    }

    if (projectId && (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE)) {
      cachedApp = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
      return cachedApp;
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        service: "firebase-admin",
        message: "Failed to initialize Firebase Admin",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }

  cachedApp = null;
  return cachedApp;
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminMessaging() {
  const app = getAdminApp();
  return app ? getMessaging(app) : null;
}
