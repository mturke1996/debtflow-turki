import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type FullScreenPortalProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * شاشة كاملة حقيقية — تغطي الـ viewport بالكامل (بما فيها AppBar و BottomNav).
 * ليست Dialog منبثقة ولا لها هوامش.
 */
export function FullScreenPortal({ open, children, className }: FullScreenPortalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={className ? `fullscreen-portal ${className}` : "fullscreen-portal"} role="dialog" aria-modal="true">
      {children}
    </div>,
    document.body
  );
}
