/// <reference types="vite/client" />

declare const APP_VERSION: string;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_DB_URL: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_GITHUB_CALLBACK_URL: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
  readonly VITE_ACCESS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
