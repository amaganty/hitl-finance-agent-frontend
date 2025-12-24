import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import ThemeToggle from "./theme-toggle";
import {
  Home,
  LineChart,
  LayoutDashboard,
  ScrollText,
  Bot,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HITL Finance Agent",
  description: "Local HITL finance dashboard (decision support + audit trail)",
};

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Trades", icon: ScrollText },
  { href: "/agent", label: "Agent Desk", icon: Bot },
  { href: "/approvals", label: "Approvals", icon: CheckCircle2 },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <header className="sticky top-0 z-50 border-b border-black/10
                             bg-white/80 backdrop-blur
                             dark:border-white/10 dark:bg-black/60">
            <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-4">
              {/* Home logo */}
              <Link
                href="/"
                className="font-semibold tracking-tight text-foreground"
              >
                HITL
              </Link>

              {/* Nav */}
              <nav className="flex items-center gap-1 text-sm">
                {nav.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2
                               text-foreground hover:bg-black/5
                               dark:hover:bg-white/10 transition"
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {children}
        </Providers>
      </body>
    </html>
  );
}
