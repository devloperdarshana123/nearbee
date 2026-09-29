import { useEffect } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { connectSocket, disconnectSocket } from "../lib/socket";

export default function SocketSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      disconnectSocket();
      return;
    }

    let cancelled = false;
    getToken().then((token) => {
      if (!cancelled && token) connectSocket(token);
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [isLoaded, isSignedIn]);

  return null;
}
