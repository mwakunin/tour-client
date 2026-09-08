"use client";

import { ReactNode, useState } from "react";
import { User, Mail, Shield, Calendar, KeyRound, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword, updateUser } from "@/lib/auth-client";
import { usersApi } from "@/lib/api/users";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";

interface ProfilePanelProps {
  /** Cards the host route wants between the account details and the danger zone */
  children?: ReactNode;
  /** Account deletion is offered on the public account page only by default */
  allowDelete?: boolean;
  /** Where to send the browser once the account is gone */
  afterDeleteHref?: string;
}

const initials = (name?: string | null, email?: string | null) => {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return (email?.charAt(0) || "U").toUpperCase();
};

const formatJoined = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

/**
 * The one profile implementation, rendered by both /profile and /admin/profile.
 * They used to be separate pages that had drifted apart — the admin copy's save
 * button was a console.log, and only the public copy could change a password.
 *
 * Name changes go through better-auth's own updateUser rather than
 * PUT /users/:id, because both write the same `user` row but only better-auth
 * refreshes the session — otherwise the navbar keeps the stale name until the
 * next sign-in.
 */
export default function ProfilePanel({
  children,
  allowDelete = false,
  afterDeleteHref = "/",
}: ProfilePanelProps) {
  const { user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  const startEditing = () => {
    setName(user.name || "");
    setIsEditing(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmed === user.name) {
      setIsEditing(false);
      return;
    }

    setIsSavingName(true);
    try {
      const result = await updateUser({ name: trimmed });
      if (result?.error) throw new Error(result.error.message || "Could not save your name");

      toast.success("Profile updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Could not update profile", { description: getApiErrorMessage(err) });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result?.error) {
        setPasswordError(result.error.message || "Failed to change password");
        return;
      }

      toast.success("Password updated — other sessions signed out");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, "Failed to change password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await usersApi.delete(user.id);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Failed to delete account. Please try again."));
      setIsDeleting(false);
      return;
    }

    // The account is gone from here on, so a failed sign-out must not be
    // reported as a failed deletion — the session is already dead server-side.
    try {
      await logout();
    } catch (err) {
      console.error("Sign-out after account deletion failed:", err);
    }

    // isDeleting stays true so the buttons remain disabled through navigation
    window.location.href = afterDeleteHref; // full reload so no stale session lingers
  };

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-on-primary flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
              {initials(user.name, user.email)}
            </div>
            <div>
              <h2 className="text-on-surface text-xl font-semibold">{user.name || "Not set"}</h2>
              <p className="text-on-surface-variant text-sm">{user.email}</p>
              <Badge variant="info" className="mt-2 capitalize">
                {user.role || "member"}
              </Badge>
            </div>
          </div>

          {!isEditing && <Button onClick={startEditing}>Edit Profile</Button>}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveName} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSavingName}
              required
            />
            <div>
              <Input label="Email" type="email" value={user.email} disabled />
              <p className="text-on-surface-variant mt-1 text-xs">
                Email is managed by your authentication provider.
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSavingName}>
                {isSavingName ? "Saving…" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSavingName}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="border-outline-variant flex items-center gap-3 border-b pb-4">
              <User className="text-on-surface-variant h-5 w-5" />
              <div>
                <p className="text-on-surface-variant text-sm">Full Name</p>
                <p className="text-on-surface font-medium">{user.name || "Not set"}</p>
              </div>
            </div>

            <div className="border-outline-variant flex items-center gap-3 border-b pb-4">
              <Mail className="text-on-surface-variant h-5 w-5" />
              <div>
                <p className="text-on-surface-variant text-sm">Email Address</p>
                <p className="text-on-surface font-medium">{user.email}</p>
              </div>
            </div>

            <div className="border-outline-variant flex items-center gap-3 border-b pb-4">
              <Shield className="text-on-surface-variant h-5 w-5" />
              <div>
                <p className="text-on-surface-variant text-sm">Account Type</p>
                <p className="text-on-surface font-medium capitalize">{user.role || "Member"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-on-surface-variant h-5 w-5" />
              <div>
                <p className="text-on-surface-variant text-sm">Member Since</p>
                <p className="text-on-surface font-medium">{formatJoined(user.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

          <Input
            label="Current password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isChangingPassword}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isChangingPassword}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            minLength={8}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={isChangingPassword}
          />

          <Button type="submit" disabled={isChangingPassword}>
            <KeyRound className="h-4 w-4" />
            {isChangingPassword ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </Card>

      {children}

      {allowDelete && (
        <div className="border-error-container bg-error-container border-2 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-on-error-container h-5 w-5" />
            <h3 className="text-on-error-container text-xl font-semibold">Danger Zone</h3>
          </div>

          <p className="text-on-error-container mb-4 text-sm">
            Once you delete your account, there is no going back. This will permanently delete your
            account, all your bookings, and remove all associated data. This action cannot be
            undone.
          </p>

          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4" />
            Delete My Account
          </Button>
        </div>
      )}

      <Dialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText("");
          setDeleteError("");
        }}
        title="Delete Account?"
        size="sm"
      >
        <p className="text-on-surface-variant mb-4">
          This action will permanently delete your account and all associated data including:
        </p>

        <ul className="text-on-surface-variant mb-6 list-inside list-disc space-y-1 text-sm">
          <li>Your profile information</li>
          <li>All booking history</li>
          <li>Payment records</li>
          <li>Preferences and settings</li>
        </ul>

        {deleteError && (
          <div className="bg-error-container text-on-error-container mb-4 p-3 text-sm">
            {deleteError}
          </div>
        )}

        <div className="mb-6">
          <Input
            label='Type "DELETE" to confirm'
            type="text"
            value={deleteConfirmText}
            onChange={(e) => {
              setDeleteConfirmText(e.target.value);
              setDeleteError("");
            }}
            placeholder="DELETE"
            disabled={isDeleting}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={isDeleting}
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmText("");
              setDeleteError("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={isDeleting || deleteConfirmText !== "DELETE"}
            onClick={handleDeleteAccount}
          >
            {isDeleting ? "Deleting…" : "Delete Account"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
