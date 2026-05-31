"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  userName: string;
  userRole: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MobileNav({ userName, userRole }: MobileNavProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/auth/sign-in";
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card border-t border-border">
      <div className="max-w-2xl mx-auto flex items-center h-16">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/dashboard") ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Dashboard
        </Link>

        <Link
          href="/fabrics"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/fabrics") ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Fabrics
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/products") ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Products
        </Link>

        <Link
          href="/production"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/production") ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Production
        </Link>

        <Link
          href="/sales"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/sales") ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          Sales
        </Link>

        <Link
          href="/expenses"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/expenses") ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Expenses
        </Link>

        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 flex-1 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </nav>
  );
}
