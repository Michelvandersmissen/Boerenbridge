import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

interface FirebaseEnv {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function leesConfig(): FirebaseEnv {
  const config: FirebaseEnv = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  const ontbreekt = (Object.keys(config) as (keyof FirebaseEnv)[]).filter(
    (key) => !config[key],
  )
  if (ontbreekt.length > 0) {
    throw new Error(
      `Firebase-configuratie ontbreekt: ${ontbreekt.join(', ')}. ` +
        'Vul je .env aan (zie .env.example).',
    )
  }
  return config
}

let appInstance: FirebaseApp | null = null
let dbInstance: Firestore | null = null

export function getDb(): Firestore {
  if (!dbInstance) {
    appInstance = initializeApp(leesConfig())
    dbInstance = getFirestore(appInstance)
  }
  return dbInstance
}
