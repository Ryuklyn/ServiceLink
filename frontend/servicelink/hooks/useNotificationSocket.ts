"use client";
import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch } from "@/store/hooks";
import { receiveRealtimeNotification } from "@/store/slices/notificationSlice";

export function useNotificationSocket() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("adminAccessToken");
    if (!token) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:8080";
    const client = new Client({ webSocketFactory: () => new SockJS(`${baseUrl}/ws`), reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => client.subscribe("/user/queue/notifications", (message) => {
        if (message.body) {
          try {
            const payload = JSON.parse(message.body);
            if (payload && payload.type === "SESSION_REVOKED") {
              window.dispatchEvent(new CustomEvent("servicelink:session-revoked", {
                detail: { message: payload.message }
              }));
              return;
            }
            dispatch(receiveRealtimeNotification(payload));
          } catch (e) {
            console.error("Failed to parse WebSocket message body", e);
          }
        }
      }),
    });
    client.activate();
    return () => { if (client.active) void client.deactivate(); };
  }, [dispatch]);
}
