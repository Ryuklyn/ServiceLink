"use client";
import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch } from "@/store/hooks";
import { receiveRealtimeNotification } from "@/store/slices/notificationSlice";

export function useNotificationSocket(recipientId?: number, role?: string) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!recipientId || !role) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe(`/user/${recipientId}/queue/notifications`, (message) => {
                    if (message.body) {
                        dispatch(receiveRealtimeNotification(JSON.parse(message.body)));
                    }
                });

                if (role === "ADMIN" || role === "PRO") {
                    stompClient.subscribe("/topic/admin-alerts", (message) => {
                        if (message.body) {
                            dispatch(receiveRealtimeNotification(JSON.parse(message.body)));
                        }
                    });
                }
            },
            onStompError: (frame) => {
                console.error("[STOMP Error]:", frame.headers["message"]);
            },
        });

        stompClient.activate();
        return () => {
            if (stompClient.active) stompClient.deactivate();
        };
    }, [recipientId, role, dispatch]);
}