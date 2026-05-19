"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuthStore } from "@/stores/auth-store";
import { fetchJson } from "@/lib/api-client";

export function AuthSync() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    if (!auth) return;

    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          id: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "User Airu",
        });

        // Ensure session cookie is set
        try {
          const idToken = await user.getIdToken();
          await fetchJson("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch (error) {
          console.error("AuthSync: Failed to sync session cookie", error);
        }
      } else {
        setUser(null);
        // Clear session cookie
        try {
          await fetchJson("/api/auth/session", { method: "DELETE" });
        } catch (error) {
          console.error("AuthSync: Failed to clear session cookie", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return null;
}
