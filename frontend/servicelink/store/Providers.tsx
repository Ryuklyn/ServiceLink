"use client";

import { Provider } from "react-redux";
import { store } from "@/store"; // matches your store/index.ts export
import NotificationBootstrap from "@/components/notifications/NotificationBootstrap";

export default function Providers({ children }: { children: React.ReactNode }) {
    return <Provider store={store}><NotificationBootstrap />{children}</Provider>;
}
