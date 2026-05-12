/**
 * Contacto para contratar o renovar membresía.
 * Definir en `.env`: VITE_MEMBRESIA_WHATSAPP, VITE_MEMBRESIA_EMAIL
 * (WhatsApp: número con código país, ej. 18095551234 o +1 809-555-1234).
 */
export function getMembresiaSoporteDefaults(): {
  whatsapp: string;
  email: string;
} {
  return {
    whatsapp: String(import.meta.env.VITE_MEMBRESIA_WHATSAPP ?? "").trim(),
    email: String(import.meta.env.VITE_MEMBRESIA_EMAIL ?? "").trim(),
  };
}
