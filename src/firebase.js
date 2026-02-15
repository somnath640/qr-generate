import { fileURLToPath } from 'node:url';

const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

export function getFirebaseConfig(env = process.env) {
  return {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID
  };
}

export function findMissingEnvVars(env = process.env) {
  return requiredEnvVars.filter((envVar) => !env[envVar]);
}

export async function initFirebase(env = process.env) {
  const missingEnvVars = findMissingEnvVars(env);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  const { initializeApp } = await import('firebase/app');
  const config = getFirebaseConfig(env);
  return initializeApp(config);
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  const missingEnvVars = findMissingEnvVars();

  if (missingEnvVars.length > 0) {
    console.log(
      `Firebase scaffold is ready. Add these environment variables to initialize at runtime: ${missingEnvVars.join(', ')}`
    );
  } else {
    await initFirebase();
    console.log('Firebase initialized successfully.');
  }
}
