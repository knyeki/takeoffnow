"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect, type ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Jobs" },
  { href: "/dashboard/upload", label: "New Takeoff" },
  { href: "/dashboard/settings", label: "Settings" },
];

function Header() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-bold text-white">
            TakeoffNow<span className="text-blue-400">.ai</span>
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {profile?.company_name && (
            <span className="text-sm text-zinc-500">
              {profile.company_name}
            </span>
          )}
          <span className="text-sm text-zinc-400">{user?.email}</span>
          <button
            onClick={signOut}
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { loading, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      !loading &&
      !profile?.company_name &&
      pathname !== "/dashboard/onboarding"
    ) {
      router.replace("/dashboard/onboarding");
    }
  }, [loading, profile, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
      </div>
    );
  }

  // Show onboarding without the full nav header
  if (pathname === "/dashboard/onboarding") {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
            <span className="text-lg font-bold text-white">
              TakeoffNow<span className="text-blue-400">.ai</span>
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
