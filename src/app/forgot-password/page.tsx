"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    // In production, this would call an API endpoint.
    // For now, we show a safe generic message.
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center p-5">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-[#166534] text-white mb-4">
            <Landmark className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="mt-1 text-sm text-[#66715f]">
            Enter your email and we&apos;ll send instructions if an account exists.
          </p>
        </div>

        <Card className="border-[#d8d1bd]">
          <CardContent className="pt-6">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <p className="text-sm text-[#374151]">
                  If an account exists for <strong>{email}</strong>, password reset
                  instructions will be sent shortly.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">Back to sign in</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">Email address</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={!!error}
                  />
                  {error && <p className="text-xs text-[#dc2626]">{error}</p>}
                </div>
                <Button type="submit" className="w-full bg-[#166534] hover:bg-[#14532d]">
                  Send reset instructions
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center">
          <Link href="/login" className="text-sm text-[#166534] hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
