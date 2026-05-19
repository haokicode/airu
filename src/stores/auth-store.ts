"use client";

import { create } from "zustand";
import type { AiruUser } from "@/lib/airu-types";

type AuthState = {
  user: AiruUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setUser: (user: AiruUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: Boolean(user) }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, isLoggedIn: false, isLoading: false }),
}));
