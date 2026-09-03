"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="size-10 border-4 border-[#166534] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#66715f]">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
