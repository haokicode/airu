"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Leaf, LogIn, LogOut, User } from "lucide-react";
import { navItems } from "@/lib/mock-data";
import { Button, LinkButton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { auth } from "@/lib/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
      router.push("/login");
    }
  };

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
        <div className="header-actions">
          {isLoggedIn ? (
            <div className="header-user">
              <Link href="/profile" className="nav-link">
                <User aria-hidden="true" />
                <span>{user?.displayName}</span>
              </Link>
              <Button variant="ghost" icon={LogOut} onClick={handleLogout} className="logout-btn">
                Keluar
              </Button>
            </div>
          ) : (
            <LinkButton href="/login" variant="secondary" icon={LogIn} className="header-login">
              Masuk
            </LinkButton>
          )}
        </div>
      </header>
      {children}
    </>
  );
}
