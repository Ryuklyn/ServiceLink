"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchNotifications, fetchUnreadCount } from "@/store/slices/notificationSlice";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { resetToOtp } from "@/store/slices/authFlowSlice";
import { clearUser } from "@/store/slices/userSlice";
import { clearProviderProfile } from "@/store/slices/providerProfileSlice";

export default function NotificationBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  useNotificationSocket();

  useEffect(() => {
    if (localStorage.getItem("accessToken") || localStorage.getItem("adminAccessToken")) {
      void dispatch(fetchUnreadCount());
      void dispatch(fetchNotifications({ page: 0, size: 20 }));
    }
  }, [dispatch]);

  useEffect(() => {
    const handleSessionRevoked = (e: Event) => {
      const customEvent = e as CustomEvent;
      const message = customEvent.detail?.message || "Your session has been revoked because your account was signed in on another device.";

      // 1. Clear session
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 2. Clear Redux slices
      dispatch(clearUser());
      dispatch(clearProviderProfile());
      dispatch(resetToOtp());

      // 3. Show toast
      toast.error(message, { toastId: "session-revoked-toast" });

      // 4. Redirect
      router.push("/login/provider");
    };

    window.addEventListener("servicelink:session-revoked", handleSessionRevoked);
    return () => {
      window.removeEventListener("servicelink:session-revoked", handleSessionRevoked);
    };
  }, [dispatch, router]);

  return null;
}
