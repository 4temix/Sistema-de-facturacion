/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEMBRESIA_WHATSAPP?: string;
  readonly VITE_MEMBRESIA_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
