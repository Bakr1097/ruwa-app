"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SideNavProps {
  userName: string;
  userRole: string;
}

const NAV_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/fabrics",
    label: "Fabrics",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: "/production",
    label: "Production",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    href: "/sales",
    label: "Sales",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export function SideNav({ userName, userRole }: SideNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/auth/sign-in";
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Top header bar — frosted glass */}
      <header
        className="fixed top-0 left-0 right-0 z-10 border-b border-border/60"
        style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 px-4">
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="w-[38px] h-[38px] flex items-center justify-center rounded-xl text-foreground transition-colors hover:bg-[var(--soft)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Wordmark */}
          <span
            className="text-[22px] font-semibold tracking-[0.01em] text-foreground"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Ruwa
          </span>

          {/* Bell icon */}
          <button
            aria-label="Notifications"
            className="w-[38px] h-[38px] flex items-center justify-center rounded-xl text-foreground transition-colors hover:bg-[var(--soft)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Scrim */}
      <div
        className={`fixed inset-0 z-20 transition-opacity duration-[250ms] ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(50,28,32,0.42)", backdropFilter: "blur(1px)" }}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Side drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[76%] max-w-[300px] z-30 bg-card flex flex-col pt-[50px] transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ boxShadow: "16px 0 40px -20px rgba(67,40,44,0.4)" }}
      >
        {/* Drawer head */}
        <div className="flex items-center justify-between px-[18px] pt-2">
          <span
            className="text-[22px] font-semibold tracking-[0.01em] text-foreground"
            style={{ fontFamily: "var(--font-head)" }}
          >
            Ruwa
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-[38px] h-[38px] flex items-center justify-center rounded-xl text-foreground hover:bg-[var(--soft)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section tag */}
        <p className="mx-[18px] mt-[6px] mb-[14px] text-[11.5px] font-semibold text-muted-foreground uppercase tracking-[0.03em]">
          Navigation
        </p>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-[2px]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-[13px] px-[14px] py-3 text-[15px] rounded-xl transition-colors ${
                isActive(link.href)
                  ? "bg-[var(--soft)] text-[var(--soft-foreground)] font-extrabold"
                  : "font-semibold text-muted-foreground hover:bg-[var(--soft)] hover:text-[var(--soft-foreground)]"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer — user card + sign out */}
        <div className="flex items-center gap-[11px] px-[18px] py-[14px] border-t border-border">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0"
            style={{ background: "var(--soft)", color: "var(--soft-foreground)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold truncate text-foreground">{userName}</p>
            <span className="text-[12px] text-muted-foreground font-semibold capitalize">{userRole}</span>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--soft)] transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
