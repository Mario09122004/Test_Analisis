// components/AuthSync.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function AuthSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si la autenticación ya cargó
    if (isLoaded) {
      // Y si hay un usuario logueado o no, recarga la página
      // Esto fuerza al layout a reevaluar el estado de autenticación
      router.refresh();
    }
  }, [isLoaded, isSignedIn, userId, router]);

  return null; // Este componente no renderiza nada visible
}