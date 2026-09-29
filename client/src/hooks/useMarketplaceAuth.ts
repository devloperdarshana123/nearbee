import { useAuth as useClerkAuth } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/authService";
import type { Role } from "../lib/types";

export function useMarketplaceAuth() {
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    enabled: clerkLoaded && !!isSignedIn,
    select: (data) => data.user,
    retry: false,
  });

  const roleMutation = useMutation({
    mutationFn: authService.updateRole,
    onSuccess: (data) => queryClient.setQueryData(["me"], data),
  });

  const profileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => queryClient.setQueryData(["me"], data),
  });

  return {
    user: meQuery.data ?? null,
    isAuthenticated: clerkLoaded && !!isSignedIn && !!meQuery.data,
    isLoading: !clerkLoaded || (!!isSignedIn && meQuery.isLoading),
    setRole: (role: Role) => roleMutation.mutateAsync({ role }),
    isSettingRole: roleMutation.isPending,
    roleError: roleMutation.error as { response?: { data?: { message?: string } } } | null,
    updateProfile: (data: { name?: string; phone?: string }) => profileMutation.mutateAsync(data),
    isUpdatingProfile: profileMutation.isPending,
    profileError: profileMutation.error as { response?: { data?: { message?: string } } } | null,
  };
}
