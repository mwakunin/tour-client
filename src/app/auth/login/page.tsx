"use client";
import { Suspense, useState } from "react";
import { authApi } from "@/lib/api/auth";
import { usePostHog } from "posthog-js/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const posthog = usePostHog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    posthog?.capture("login_button_clicked", { method: "google" });
    authApi.login(`${window.location.origin}${returnTo}`);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    posthog?.capture("login_button_clicked", { method: "email" });

    try {
      const result = await authApi.loginWithEmail(email, password);
      if (result?.error) {
        setError(result.error.message || "Invalid email or password");
      } else {
        router.push(returnTo);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your bookings and account"
      imageSrc="/images/hero/safari-3.webp"
      imageAlt="Safari vehicle on the Kenyan savannah"
      tagline="Your next adventure is waiting"
      footer={
        <p className="text-inverse-on-surface/70 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      }
    >
      <Card>
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {error && <p className="text-error text-sm">{error}</p>}

          <Input
            id="email"
            type="email"
            label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-2 text-right">
              <Link href="/auth/forgot-password" className="text-primary text-sm font-medium">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="border-outline-variant w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface-container-lowest text-on-surface-variant px-2">or</span>
          </div>
        </div>

        <Button onClick={handleGoogleLogin} className="w-full" variant="primary">
          Continue with Google
        </Button>
      </Card>
    </AuthLayout>
  );
}
