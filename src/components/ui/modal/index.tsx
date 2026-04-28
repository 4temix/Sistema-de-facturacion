import { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  CloseClickBanner?: boolean;
  zIndex?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
  CloseClickBanner = true,
  zIndex = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const zClass = zIndex === "" ? "z-50" : zIndex;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : [
        "relative w-full max-h-[min(92dvh,calc(100dvh-1.5rem))] overflow-hidden",
        "rounded-2xl sm:rounded-3xl",
        "bg-white dark:bg-gray-900",
        "shadow-2xl shadow-gray-900/10 dark:shadow-black/50",
        "ring-1 ring-gray-900/[0.06] dark:ring-white/[0.08]",
        "flex flex-col",
      ].join(" ");

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center overflow-hidden overscroll-contain sm:items-center sm:p-4 ${zClass}`}
    >
      {!isFullscreen && (
        <div
          className="fixed inset-0 bg-gray-900/45 backdrop-blur-sm transition-opacity dark:bg-black/60"
          aria-hidden
          onClick={() => {
            if (CloseClickBanner) {
              onClose();
            }
          }}
        />
      )}
      <div
        ref={modalRef}
        className={`${contentClasses} ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 z-[60] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200/80 bg-white/95 text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-800/95 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700 dark:hover:text-white sm:right-4 sm:top-4 sm:h-11 sm:w-11"
            aria-label="Cerrar"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain rounded-b-2xl [-webkit-overflow-scrolling:touch] sm:rounded-b-3xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb:hover]:bg-blue-600"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
