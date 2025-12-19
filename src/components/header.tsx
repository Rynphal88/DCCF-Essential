"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  // These still target sections on the dashboard (future: dedicated pages)
  { label: "Compass", href: "/dashboard#compass" },
  { label: "Rituals", href: "/dashboard#rituals" },
  { label: "Wins", href: "/dashboard#wins" },
  // New: future-proof entry to the research universe
  { label: "Research Hub", href: "/research" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    // usePathname never includes the hash, so all /dashboard#* share /dashboard
    if (href === "/") return pathname === "/";
    if (href.startsWith("/dashboard")) return pathname.startsWith("/dashboard");
    return pathname === href;
  };

  return (
    <header className="border-b bg-card/80 backdrop-blur-xs">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Left: Logo + Title */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-soft">
            <span className="text-[11px] font-semibold text-primary-foreground">
              DCCF
            </span>
          </div>
          <div className="text-left">
            <h1 className="text-base font-semibold leading-tight">
              DCCF Essential
            </h1>
            <p className="text-xs text-muted-foreground">
              Doctoral Control &amp; Clarity Framework
            </p>
          </div>
        </button>

        {/* Center: Primary Nav (desktop only) */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "relative transition-colors",
                isActive(item.href)
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
              {/* underline for active link */}
              {isActive(item.href) && (
                <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Theme toggle + actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle is always visible */}
          <ThemeToggle />

          {/* Auth / session actions (desktop only) */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Sign in – wired for future auth page */}
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Sign in
            </button>

            {/* Open Today’s Session – now actually opens dashboard */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
            >
              Open Today&apos;s Session
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
