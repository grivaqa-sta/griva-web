"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./UserContext";
import { usePathname } from "next/navigation";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { state } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Determine the correct token based on path and role
    const getActiveToken = (): string | null => {
      if (typeof window === "undefined") return null;
      
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) {
        const activeRole = sessionStorage.getItem("griva_active_role");
        if (activeRole === "staff") {
          return localStorage.getItem("griva_staff_token");
        } else if (activeRole === "admin") {
          return localStorage.getItem("griva_admin_token");
        }
        return localStorage.getItem("griva_admin_token") || localStorage.getItem("griva_staff_token");
      } else if (currentPath.startsWith("/delivery")) {
        return localStorage.getItem("griva_delivery_token");
      }
      // Customer frontend does not use sockets, only admin and delivery do.
      return null;
    };

    // Returns the localStorage key for the token in the current path context
    const getTokenKey = (): string | null => {
      if (typeof window === "undefined") return null;
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/delivery")) return "griva_delivery_token";
      if (currentPath.startsWith("/admin")) {
        const activeRole = sessionStorage.getItem("griva_active_role");
        if (activeRole === "staff") return "griva_staff_token";
        return "griva_admin_token";
      }
      return null;
    };

    const token = getActiveToken();

    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Validate token expiry before attempting a connection
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token is already expired — clear it and bail out, no socket attempt
        const key = getTokenKey();
        if (key) localStorage.removeItem(key);
        if (socket) {
          socket.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
        return;
      }
    } catch {
      // Malformed token — ignore and let the server reject it
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

    const socketIo = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketIo.on("connect", () => {
      setIsConnected(true);
    });

    socketIo.on("disconnect", () => {
      setIsConnected(false);
    });

    socketIo.on("connect_error", (error) => {
      setIsConnected(false);
      // Auth errors (expired / invalid token) — stop looping, clear the stale token
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("jwt") || msg.includes("expired") || msg.includes("authentication failed") || msg.includes("unauthorized")) {
        socketIo.disconnect();
        const key = getTokenKey();
        if (key) localStorage.removeItem(key);
      }
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [state.isLoggedIn, state.role, state.token, pathname]); // Reconnect when authentication status, role, token, or page path changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
