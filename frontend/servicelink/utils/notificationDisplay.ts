import type { NotificationItem } from "@/store/slices/notificationSlice";

export type NotifTab = "booking" | "platform";
export type NotifIconKey = "calendar" | "alert" | "star" | "check" | "info";

/** Now uses the real backend category — no more guessing from the URL. */
export function inferTab(n: NotificationItem): NotifTab {
    return n.category === "BOOKING" ? "booking" : "platform";
}

export function inferIcon(n: NotificationItem): { icon: NotifIconKey; bg: string } {
    const t = (n.title ?? "").toLowerCase();

    if (t.includes("request")) return { icon: "alert", bg: "#1e3a8a" };
    if (t.includes("confirm") || t.includes("accept")) return { icon: "calendar", bg: "#e8683f" };
    if (t.includes("complet")) return { icon: "check", bg: "#16a34a" };
    if (t.includes("review") || t.includes("star")) return { icon: "star", bg: "#1e3a8a" };
    return { icon: "info", bg: "#1e3a8a" };
}

export function formatRelativeTime(iso: string): string {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;

    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}