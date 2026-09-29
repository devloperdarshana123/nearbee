import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { setTokenGetter } from "../lib/api";

// Keeps the axios instance's token source in sync with Clerk's current
// session so authenticated API calls (auth/me, bookings, etc.) actually
// carry a valid Authorization header. Reads getToken through a ref so the
// effect below only runs once, since Clerk hands back a new getToken
// function identity on most renders (which would otherwise churn the
// setTokenGetter subscription on every render).
export default function AuthTokenSync() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    setTokenGetter(() => getTokenRef.current());
    return () => setTokenGetter(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
