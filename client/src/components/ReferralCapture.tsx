import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/tanstack-react-start";
import { applyReferral } from "../services/authService";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";

const STORAGE_KEY = "nearbee-pending-referral";

// Captures a `?ref=CODE` link param into localStorage on any page load, then
// applies it once the visitor is signed in and hasn't already been credited
// to a referrer — covers both "click link, then sign up" and "sign up, then
// click link later" orderings without needing a dedicated signup step.
export default function ReferralCapture() {
  const { isSignedIn } = useUser();
  const { user } = useMarketplaceAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      try {
        localStorage.setItem(STORAGE_KEY, ref.toUpperCase());
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (code: string) => applyReferral(code),
    onSuccess: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    },
  });

  useEffect(() => {
    if (!isSignedIn || !user || user.hasBeenReferred || mutation.isPending) return;
    let pending: string | null = null;
    try {
      pending = localStorage.getItem(STORAGE_KEY);
    } catch {
      pending = null;
    }
    if (pending) mutation.mutate(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  return null;
}
