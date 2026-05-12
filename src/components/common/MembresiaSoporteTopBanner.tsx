import { useUserData } from "../../context/GlobalUserContext";
import { getMembershipVisualPhase } from "../../Utilities/membershipTime";
import { getMembresiaSoporteDefaults } from "../../config/membresiaSoporte";
import MembresiaSoporteCta from "./MembresiaSoporteCta";

/**
 * Franja fija en la parte superior del área principal (debajo del header),
 * visible en todas las pantallas autenticadas cuando no hay membresía o está vencida.
 */
export default function MembresiaSoporteTopBanner() {
  const { user } = useUserData();
  if (!user) return null;

  const m = user.membership ?? null;
  const mustContact =
    m == null || getMembershipVisualPhase(m) === "expired";
  if (!mustContact) return null;

  const { whatsapp, email } = getMembresiaSoporteDefaults();

  return (
    <div
      className="shrink-0 border-b border-amber-200/90 bg-gradient-to-r from-amber-50/95 via-white to-amber-50/95 dark:border-amber-900/50 dark:from-amber-950/50 dark:via-gray-900 dark:to-amber-950/50"
      role="region"
      aria-label="Contacto para membresía"
    >
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-2.5 sm:px-6">
        <MembresiaSoporteCta
          variant="banner"
          title="Para contratar o renovar tu membresía, contáctanos:"
          whatsappPhone={whatsapp}
          email={email}
        />
      </div>
    </div>
  );
}
