"use client";
import { Suspense, useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset your password"
      imageSrc="/images/hero/safari-3.webp"
      imageAlt="Safari vehicle on the Kenyan savannah"
      tagline="Your next adventure is waiting"
      footer={
        <p className="text-inverse-on-surface/70 text-sm">
          Remembered your password?{" "}
          <Link href="/auth/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <Card>
        {submitted ? (
          <p className="text-body-md text-on-surface">
            If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a
            link to reset your password. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-error text-sm">{error}</p>}

            <Input
              id="email"
              type="email"
              label="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}
