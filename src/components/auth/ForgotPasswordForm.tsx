"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockForgotPassword } from "@/lib/auth/mockAuth";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await mockForgotPassword(email);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-center">
          <p className="text-sm text-green-600">
            Password reset link has been sent to your email!
          </p>
          <p className="mt-2 text-xs text-green-500">
            Redirecting to login page...
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <p className="text-xs text-gray-500">
          We'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{" "}
        <Link href="/login" className="text-purple-600 hover:text-purple-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
