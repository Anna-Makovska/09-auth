"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkSession } from "@/lib/api/clientApi";
import useAuthStore from "@/lib/store/authStore";

const privateRoutes = ["/profile", "/notes"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isInitialized || !hasHydrated) return;

    const verifySession = async () => {
      if (isAuthenticated) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        const user = await checkSession();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    verifySession();
  }, [hasHydrated, isInitialized, isAuthenticated, setUser]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const isPrivateRoute = privateRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isPrivateRoute && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [pathname, isAuthenticated, isInitialized, isLoading, router]);

  if (isLoading || !hasHydrated) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivateRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
