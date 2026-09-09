"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import type { UserUpdate } from "@/lib/api/users";

export interface EditableUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface EditUserDialogProps {
  user: EditableUser | null;
  onClose: () => void;
  onSave: (id: string, updates: UserUpdate) => void;
  isSaving: boolean;
  /** The signed-in admin — demoting yourself would lock you out of this page */
  currentUserId?: string;
}

export default function EditUserDialog({
  user,
  onClose,
  onSave,
  isSaving,
  currentUserId,
}: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  // Re-seed whenever a different row is opened
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role);
  }, [user]);

  if (!user) return null;

  const isSelf = user.id === currentUserId;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const updates: UserUpdate = {
    ...(trimmedName !== user.name ? { name: trimmedName } : {}),
    ...(trimmedEmail !== user.email ? { email: trimmedEmail } : {}),
    ...(role !== user.role && !isSelf ? { role } : {}),
  };

  const nothingChanged = Object.keys(updates).length === 0;
  const invalid = trimmedName === "" || trimmedEmail === "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nothingChanged || invalid) return;
    onSave(user.id, updates);
  };

  return (
    <Dialog open onClose={onClose} title="Edit user" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={trimmedName === "" ? "Name is required" : undefined}
          disabled={isSaving}
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={trimmedEmail === "" ? "Email is required" : undefined}
          disabled={isSaving}
          required
        />

        <div>
          <label htmlFor="edit-user-role" className="label-caps text-on-surface-variant mb-2 block">
            Role
          </label>
          <select
            id="edit-user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
            disabled={isSaving || isSelf}
            className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {isSelf && (
            <p className="mt-1 text-xs text-amber-700">
              You cannot change your own role — ask another admin.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSaving || nothingChanged || invalid}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
