import MembershipStatusChip from "../common/MembershipStatusChip";

/**
 * Indicador de membresía en cabecera escritorio/tablet (md+).
 * En móvil el mismo dato va en el menú lateral ({@link AppSidebar}).
 */
export default function HeaderMembershipBadge() {
  return (
    <div className="hidden max-w-[14.5rem] md:flex">
      <MembershipStatusChip density="default" />
    </div>
  );
}
