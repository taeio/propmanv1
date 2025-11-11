import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

type AllowedRole = "tenant" | "property_manager" | "both";

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRole: AllowedRole
) {
  const ProtectedComponent: React.FC<P> = (props: P) => {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
      if (isLoading) return;

      if (!user) {
        router.push("/auth");
        return;
      }

      const userRole = user.role || "property_manager";

      if (allowedRole === "both") {
        return;
      }

      if (allowedRole === "tenant" && userRole !== "tenant") {
        router.push("/");
        return;
      }

      if (allowedRole === "property_manager" && userRole === "tenant") {
        router.push("/tenant");
        return;
      }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
      return null;
    }

    const userRole = user.role || "property_manager";

    if (allowedRole === "both") {
      return <Component {...props} />;
    }

    if (allowedRole === "tenant" && userRole !== "tenant") {
      return null;
    }

    if (allowedRole === "property_manager" && userRole === "tenant") {
      return null;
    }

    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${Component.displayName || Component.name || "Component"})`;

  return ProtectedComponent;
}
