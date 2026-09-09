"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: DialogProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div
        className={cn(
          "bg-surface-container-lowest shadow-elevated relative mx-4 max-h-[90vh] w-full overflow-hidden rounded-none",
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="border-outline-variant border-b px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                {title && <h2 className="text-headline-sm text-on-surface">{title}</h2>}
                {description && (
                  <p className="text-body-md text-on-surface-variant mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
};
