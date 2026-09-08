"use client";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ newPassword, token: token! });
      if (result?.error) {
        setError(result.error.message || "Could not reset password");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <p className="text-inverse-on-surface/70 text-sm">
      Back to{" "}
      <Link href="/auth/login" className="text-primary font-medium">
        Sign in
      </Link>
    </p>
  );

  if (!token) {
    return (
      <AuthLayout
        title="Invalid link"
        subtitle="This password reset link is invalid or has expired"
        imageSrc="/images/hero/safari-3.webp"
        imageAlt="Safari vehicle on the Kenyan savannah"
        tagline="Your next adventure is waiting"
        footer={footer}
      >
        <Card>
          <p className="text-body-md text-on-surface">
            Please request a new reset link from the{" "}
            <Link href="/auth/forgot-password" className="text-primary font-medium">
              forgot password
            </Link>{" "}
            page.
          </p>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password for your account"
      imageSrc="/images/hero/safari-3.webp"
      imageAlt="Safari vehicle on the Kenyan savannah"
      tagline="Your next adventure is waiting"
      footer={footer}
    >
      <Card>
        {success ? (
          <div className="space-y-4">
            <p className="text-body-md text-on-surface">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Button className="w-full" onClick={() => router.push("/auth/login")}>
              Sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-error text-sm">{error}</p>}

            <Input
              id="newPassword"
              type="password"
              label="New password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirm new password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}
