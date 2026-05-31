"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  userName: string;
  userRole: string;
}

export function MobileNav({ userName: _userName, userRole: _userRole }: MobileNavProps) {
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
          href="/fabrics"
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isActive("/fabrics")
              ? "text-primary font-semibold"
              : "text-muted-foreground"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Fabrics
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
