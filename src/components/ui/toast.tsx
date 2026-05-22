"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = window.setTimeout(onClose, 1800);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-3xl bg-foreground/95 px-4 py-3 text-sm text-background shadow-lg shadow-black/20 backdrop-blur-xl",
      )}
    >
      {message}
    </div>,
    document.body,
  );
}
