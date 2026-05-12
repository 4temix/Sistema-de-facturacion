import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

export type MembresiaSoporteCtaProps = {
  /** Teléfono WhatsApp (se normaliza a dígitos para wa.me). */
  whatsappPhone?: string;
  email?: string;
  /** Título corto encima de los enlaces. */
  title?: string;
  variant?: "compact" | "default" | "banner";
  className?: string;
};

function onlyDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildWhatsappUrl(phone: string): string | null {
  const d = onlyDigits(phone);
  if (!d) return null;
  return `https://wa.me/${d}`;
}

/**
 * Bloque reutilizable: a quién escribir para contratar o actualizar membresía.
 * Iconos: WhatsApp (FaWhatsapp) y correo (MdOutlineEmail).
 */
export default function MembresiaSoporteCta({
  whatsappPhone = "",
  email = "",
  title = "Contratar o renovar",
  variant = "default",
  className = "",
}: MembresiaSoporteCtaProps) {
  const waUrl = whatsappPhone ? buildWhatsappUrl(whatsappPhone) : null;
  const mail = email.trim();
  const hasLinks = Boolean(waUrl || mail);

  if (variant === "banner") {
    return (
      <div
        className={`flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
      >
        <p className="text-center text-sm font-medium text-gray-800 dark:text-gray-100 sm:text-left">
          {title}
        </p>
        {hasLinks ? (
          <div className="flex items-center justify-center gap-3 sm:justify-end">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir WhatsApp"
                title="WhatsApp"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                <FaWhatsapp className="h-6 w-6" aria-hidden />
              </a>
            )}
            {mail && (
              <a
                href={`mailto:${mail}`}
                aria-label="Enviar correo"
                title="Correo"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-1 ring-gray-200 transition hover:scale-105 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-gray-800 dark:text-brand-400 dark:ring-gray-600 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900"
              >
                <MdOutlineEmail className="h-6 w-6" aria-hidden />
              </a>
            )}
          </div>
        ) : (
          <p className="text-center text-xs text-gray-600 dark:text-gray-400 sm:text-right">
            Pide a tu administrador los datos de contacto para contratar o renovar.
          </p>
        )}
      </div>
    );
  }

  const baseWrap =
    variant === "compact"
      ? "rounded-lg border border-dashed border-gray-300/90 bg-white/60 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900/40"
      : "rounded-xl border border-dashed border-gray-300 bg-gray-50/80 p-3 dark:border-gray-600 dark:bg-gray-800/50";

  const linkClass =
    variant === "compact"
      ? "inline-flex items-center gap-1.5 rounded-md bg-[#25D366]/15 px-2 py-0.5 text-[11px] font-medium text-[#128C7E] hover:bg-[#25D366]/25 dark:text-[#53c98a]"
      : "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366]/15 px-3 py-2 text-xs font-medium text-[#128C7E] hover:bg-[#25D366]/25 dark:text-[#53c98a] sm:flex-initial";

  const mailClass =
    variant === "compact"
      ? "inline-flex items-center gap-1.5 rounded-md bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-700 hover:bg-brand-500/15 dark:text-brand-300"
      : "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500/10 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-500/15 dark:text-brand-300 sm:flex-initial";

  return (
    <div className={`${baseWrap} ${className}`.trim()}>
      <p
        className={
          variant === "compact"
            ? "text-[10px] font-medium text-gray-600 dark:text-gray-400"
            : "text-xs font-medium text-gray-700 dark:text-gray-300"
        }
      >
        {title}
      </p>
      {hasLinks ? (
        <div
          className={
            variant === "compact"
              ? "mt-1 flex flex-wrap items-center gap-1.5"
              : "mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
          }
        >
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <FaWhatsapp className="h-4 w-4 shrink-0" aria-hidden />
              WhatsApp
            </a>
          )}
          {mail && (
            <a href={`mailto:${mail}`} className={mailClass}>
              <MdOutlineEmail className="h-4 w-4 shrink-0" aria-hidden />
              Correo
            </a>
          )}
        </div>
      ) : (
        <p className="mt-1 text-[10px] leading-snug text-gray-500 dark:text-gray-400">
          Pide a tu administrador los datos de contacto para contratar o renovar.
        </p>
      )}
    </div>
  );
}
