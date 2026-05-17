import Link from "next/link";
import type { ReactNode } from "react";
import { Leaf, LogIn } from "lucide-react";
import { navItems } from "@/lib/mock-data";
import { LinkButton } from "@/components/ui";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand-link" aria-label="Airu home">
          <span className="brand-mark">
            <Leaf aria-hidden="true" />
          </span>
          <span>Airu</span>
        </Link>
        <nav className="site-nav" aria-label="Navigasi utama">
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="nav-link">
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <LinkButton href="/login" variant="secondary" icon={LogIn} className="header-login">
          Masuk
        </LinkButton>
      </header>
      {children}
    </>
  );
}
