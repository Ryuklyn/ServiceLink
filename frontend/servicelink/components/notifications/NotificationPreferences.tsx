"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import type { NotificationCategory } from "@/store/slices/notificationSlice";

const labels: Record<NotificationCategory, string> = { BOOKING: "Bookings", JOB_TICKET: "Job tickets", PLATFORM: "Platform changes", BILLING: "Billing", SLA: "SLA alerts", COMPLIANCE: "Compliance", SYSTEM: "System alerts" };
type Preference = { category: NotificationCategory; enabled: boolean };
export default function NotificationPreferences() {
  const [items, setItems] = useState<Preference[]>([]); const [saving, setSaving] = useState<NotificationCategory | null>(null);
  useEffect(() => { api.get<Preference[]>("/notifications/preferences").then((r) => setItems(r.data)).catch(() => setItems([])); }, []);
  const toggle = async (item: Preference) => { const enabled = !item.enabled; setSaving(item.category); setItems((prev) => prev.map((p) => p.category === item.category ? { ...p, enabled } : p)); try { await api.put(`/notifications/preferences/${item.category}`, null, { params: { enabled } }); } catch { setItems((prev) => prev.map((p) => p.category === item.category ? item : p)); } finally { setSaving(null); } };
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-base font-bold text-slate-900">Notification preferences</h3><p className="mt-1 mb-4 text-sm text-slate-500">Disabled categories are not persisted or sent in real time.</p><div className="divide-y divide-slate-100">{items.map((item) => <div key={item.category} className="flex justify-between items-center py-3"><span><b className="text-sm text-slate-800">{labels[item.category]}</b><small className="block text-xs text-slate-400">{item.enabled ? "Enabled" : "Disabled"}</small></span><button disabled={saving === item.category} onClick={() => void toggle(item)} aria-pressed={item.enabled} className={`relative h-6 w-11 rounded-full p-0.5 ${item.enabled ? "bg-[#1e3a8a]" : "bg-slate-300"}`}><span className={`block h-5 w-5 rounded-full bg-white transition-transform ${item.enabled ? "translate-x-5" : ""}`} /></button></div>)}</div></section>;
}
