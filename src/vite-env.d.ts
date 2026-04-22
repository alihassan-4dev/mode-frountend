/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional. Base URL of the API (e.g. https://api.example.com).
   * Leave unset in development to use the Vite proxy (`/api` → 127.0.0.1:8000).
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
