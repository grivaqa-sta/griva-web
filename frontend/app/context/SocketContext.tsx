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

    const token = getActiveToken();

    if (!token) {
      if (socket) {
        console.log("🔌 [Socket.IO Client]: Disconnecting because no token was found.");
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
    console.log(`🔌 [Socket.IO Client]: Connecting to ${socketUrl}...`);

    const socketIo = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketIo.on("connect", () => {
      console.log("🔌 [Socket.IO Client]: Connected with connection ID:", socketIo.id);
      setIsConnected(true);
    });

    socketIo.on("disconnect", (reason) => {
      console.warn("🔌 [Socket.IO Client]: Disconnected. Reason:", reason);
      setIsConnected(false);
    });

    socketIo.on("connect_error", (error) => {
      console.error("🔌 [Socket.IO Client]: Connection Error:", error.message);
      setIsConnected(false);
    });

    setSocket(socketIo);

    return () => {
      console.log("🔌 [Socket.IO Client]: Cleaning up socket connection...");
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
