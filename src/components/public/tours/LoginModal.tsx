"use client";

import { Lock, UserPlus } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { Dialog } from "@/components/ui/dialog";
import Button from "@/components/ui/button";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  returnPath?: string;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  message = "Please login or create an account to continue booking",
  returnPath,
}: LoginRequiredModalProps) {
  const handleLogin = () => {
    // Get current path or use provided returnPath
    const currentPath = returnPath || window.location.pathname + window.location.search;
    authApi.login(`${window.location.origin}${currentPath}`);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Login Required" size="sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <Lock className="text-primary h-5 w-5" />
        </div>
      </div>

      <p className="text-on-surface-variant mb-6">{message}</p>

      <div className="space-y-3">
        <Button
          onClick={handleLogin}
          variant="primary"
          className="flex w-full items-center justify-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          Login or Sign Up
        </Button>
        <Button onClick={onClose} variant="secondary" className="w-full">
          Maybe Later
        </Button>
      </div>

      <p className="text-on-surface-variant mt-4 text-center text-xs">
        You'll be redirected to our secure login page. After signing in, you'll return here to
        complete your booking.
      </p>
    </Dialog>
  );
}
