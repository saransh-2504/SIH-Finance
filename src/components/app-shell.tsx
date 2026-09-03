"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Calculator,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  Plus,
  Radar,
  Settings,
  Store,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Radar },
  { href: "/compare", label: "Compare", icon: BarChart3 },
  { href: "/finance", label: "Finance", icon: Calculator },
  { href: "/schemes", label: "Schemes", icon: Landmark },
  { href: "/advisor", label: "AI Advisor", icon: Mic },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/opportunities", label: "Discover", icon: Radar },
  { href: "/advisor", label: "Advisor", icon: Mic },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#1f2937]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#d8d1bd] bg-[#0f2d1c] p-5 text-white lg:flex">
        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d97706]">
            <Store className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Business Intelligence</p>
            <h1 className="text-sm font-semibold leading-tight">GramUdyam Advisor</h1>
          </div>
        </div>

        <nav className="mt-5 flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <Link href="/assessment/new">
            <Button size="sm" className="w-full bg-[#d97706] text-white hover:bg-[#b45309]">
              <Plus className="size-4 mr-2" />
              New Assessment
            </Button>
          </Link>
          <div className="flex items-center gap-3 px-1">
            <div className="size-8 shrink-0 rounded-full bg-white/10 grid place-items-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-white/40 hover:text-white">
              <LogOut className="size-4" />
            </button>
          </div>
          <p className="rounded-xl border border-white/10 p-3 text-[10px] leading-relaxed text-white/40">
            Decision support only. No guarantee of loan approval, profit or business success.
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#0f2d1c] p-5 text-white flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="size-8 grid place-items-center rounded-lg bg-[#d97706]">
                  <Store className="size-4" />
                </div>
                <span className="text-sm font-semibold">GramUdyam Advisor</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="size-5 text-white/60" />
              </button>
            </div>
            <nav className="mt-4 flex-1 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    pathname === href ? "bg-white/10 text-white font-medium" : "text-white/60",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 pt-4 space-y-3">
              <Link href="/assessment/new" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full bg-[#d97706] text-white hover:bg-[#b45309]">
                  <Plus className="size-4 mr-2" /> New Assessment
                </Button>
              </Link>
              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white">
                <LogOut className="size-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e2dccb] bg-[#f8f7f2]/95 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#166534]">
                Rural Business Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-1 border-[#d97706]/30 text-[#d97706] text-[10px]">
              <TrendingUp className="size-3" /> Live Platform
            </Badge>
            <Link href="/assessment/new">
              <Button size="sm" className="hidden sm:flex bg-[#166534] hover:bg-[#14532d] text-white">
                <Plus className="size-4 mr-1" /> New Assessment
              </Button>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 pb-24 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d8d1bd] bg-white lg:hidden">
        <div className="grid grid-cols-4">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors",
                pathname === href ? "text-[#166534]" : "text-[#9ca3af]",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
