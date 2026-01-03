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
  const { setUser, clearAuth, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial session check - only once on mount
  useEffect(() => {
    if (isInitialized) return;

    const verifySession = async () => {
      try {
        const user = await checkSession();
        if (user) {
          setUser(user);
        } else {
          clearAuth();
        }
      } catch (error) {
        clearAuth();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    verifySession();
  }, [isInitialized, setUser, clearAuth]);

  // Handle redirects when route changes
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const isPrivateRoute = privateRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isPrivateRoute && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [pathname, isAuthenticated, isInitialized, isLoading, router]);

  // Show loader while initial check
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  // Don't render private content if not authenticated
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivateRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
