"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
  const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const variants = {
    success: "bg-secondary-container border-secondary-container text-on-secondary-container",
    error: "bg-error-container border-error-container text-on-error-container",
    warning: "bg-tertiary-container border-tertiary-container text-on-tertiary-container",
    info: "bg-primary-container border-primary-container text-on-primary-container",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={cn(
        "animate-slide-in shadow-elevated flex min-w-[300px] items-center gap-3 rounded-none border px-4 py-3",
        variants[toast.type]
      )}
    >
      <span className="text-xl">{icons[toast.type]}</span>
      <p className="text-body-md flex-1">{toast.message}</p>
      <button onClick={onClose} className="opacity-70 transition-colors hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
