import { useState } from "react";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0] ?? "";
  const b = parts[parts.length - 1][0] ?? "";
  return `${a}${b}`.toUpperCase();
}

function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

type Props = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  imgClassName?: string;
};

/**
 * Muestra la foto del usuario o, si no hay URL o falla la carga, un círculo con iniciales y color estable.
 */
export default function UserAvatarWithFallback({
  name,
  imageUrl,
  className = "h-11 w-11",
  imgClassName = "w-full h-full object-cover",
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const trimmed = (imageUrl ?? "").trim();
  const showPhoto = trimmed.length > 0 && !imgFailed;
  const initials = initialsFromName(name || "Usuario");
  const hue = hueFromString(name || "x");

  if (!showPhoto) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-inner ${className}`}
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 58%, 42%), hsl(${(hue + 48) % 360}, 52%, 32%))`,
        }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <span className={`inline-block shrink-0 overflow-hidden rounded-full ${className}`}>
      <img
        src={trimmed}
        alt=""
        className={imgClassName}
        onError={() => setImgFailed(true)}
      />
    </span>
  );
}
