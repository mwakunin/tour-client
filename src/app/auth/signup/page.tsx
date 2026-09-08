"use client";
import { useState } from "react";
import { authApi } from "@/lib/api/auth";
import { usePostHog } from "posthog-js/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";

export default function SignUpPage() {
  const posthog = usePostHog();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = () => {
    posthog?.capture("signup_button_clicked", { method: "google" });
    authApi.login(); // social sign-in creates the account automatically if it doesn't exist
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    posthog?.capture("signup_button_clicked", { method: "email" });

    try {
      const result = await authApi.signup(name, email, password);
      if (result?.error) {
        setError(result.error.message || "Could not create account");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us to start planning your safari"
      imageSrc="/images/hero/safari-5.webp"
      imageAlt="Wildlife on the Kenyan plains"
      tagline="Magical African safaris, tailored for you"
      footer={
        <p className="text-inverse-on-surface/70 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <Card>
        <form onSubmit={handleEmailSignup} className="space-y-4">
          {error && <p className="text-error text-sm">{error}</p>}

          <Input
            id="name"
            type="text"
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            id="email"
            type="email"
            label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
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

        <Button onClick={handleGoogleSignup} className="w-full" variant="primary">
          Continue with Google
        </Button>
      </Card>
    </AuthLayout>
  );
}
