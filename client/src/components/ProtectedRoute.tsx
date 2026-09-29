import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth as useClerkAuth } from "@clerk/tanstack-react-start";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import type { Role } from "../lib/types";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const { user, isLoading } = useMarketplaceAuth();

  if (!clerkLoaded || isLoading) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
