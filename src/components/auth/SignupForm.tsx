"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const role = searchParams.get("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      // If user came from role selection, go directly to dashboard
      if (role === "ecosystem") {
        router.push("/dashboard");
      } else {
        router.push("/select-platform");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          At least 8 characters, 1 uppercase, 1 number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex items-start space-x-2">
        <input
          id="terms"
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          disabled={isLoading}
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{" "}
          <Link href="/terms" className="text-purple-600 hover:text-purple-700">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-purple-600 hover:text-purple-700"
          >
            Privacy Policy
          </Link>
        </label>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-600 hover:text-purple-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
