import { useUserData } from "../../context/GlobalUserContext";
import {
  getMembershipIndicatorShort,
  getMembershipVisualPhase,
  type MembershipVisualPhase,
} from "../../Utilities/membershipTime";
import { TbCreditCard } from "react-icons/tb";

function phaseBoxClass(phase: MembershipVisualPhase): string {
  if (phase === "none") {
    return "border-gray-200 bg-gray-50/95 text-gray-800 dark:border-gray-600 dark:bg-gray-800/70 dark:text-gray-100";
  }
  if (phase === "expired") {
    return "border-red-200 bg-red-50/90 text-red-900 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-100";
  }
  if (phase === "grace") {
    return "border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100";
  }
  return "border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-100";
}

export type MembershipStatusChipProps = {
  /** `compact` para menú móvil; `default` coincide con cabecera escritorio. */
  density?: "default" | "compact";
  className?: string;
};

/**
 * Estado de membresía (plan, vigencia / gracia / vencida / sin plan).
 */
export default function MembershipStatusChip({
  density = "default",
  className = "",
}: MembershipStatusChipProps) {
  const { user } = useUserData();
  if (!user) return null;

  const m = user.membership ?? null;
  const apiPhase = getMembershipVisualPhase(m);
  const { title, subtitle } = getMembershipIndicatorShort(m);
  const visualPhase: MembershipVisualPhase =
    !m ? "none" : apiPhase === "none" ? "active" : apiPhase;

  const compact = density === "compact";

  return (
    <div
      className={`w-full rounded-xl border shadow-sm ${phaseBoxClass(visualPhase)} ${
        compact ? "px-2 py-1.5" : "px-2.5 py-1.5"
      } ${className}`.trim()}
    >
      <div className="flex items-center gap-1.5">
        <TbCreditCard
          className={`shrink-0 opacity-85 ${compact ? "h-4 w-4" : "h-3.5 w-3.5"}`}
          aria-hidden
        />
        <span
          className={`min-w-0 flex-1 truncate font-semibold leading-tight ${
            compact ? "text-[11px]" : "text-xs"
          }`}
        >
          {title}
        </span>
      </div>
      {subtitle ? (
        <p
          className={`mt-0.5 truncate font-medium leading-tight opacity-90 ${
            compact ? "pl-5 text-[9px]" : "pl-5 text-[10px]"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
