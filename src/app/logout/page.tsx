"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await fetch("/api/logout", {
        method: "POST",
      });

      router.replace("/login");
      router.refresh();
    }

    logout();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Logout...</p>
    </main>
  );
}