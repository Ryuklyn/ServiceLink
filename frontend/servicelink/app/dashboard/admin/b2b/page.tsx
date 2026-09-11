"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, Clock, RefreshCw, Search, ShieldCheck, UserRound } from "lucide-react";
import api from "@/utils/axios";

type RegistrationStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

interface B2BClient {
    organizationId: number;
    workspaceId: number | null;
    proUserId: number | null;
    adminUserId: number | null;
    companyName: string;
    businessType: string | null;
    companySize: string | null;
    workEmail: string;
    contactNumber: string;
    workspaceName: string | null;
    primaryBranchLocation: string | null;
    adminName: string | null;
    adminEmail: string | null;
    taxId: string | null;
    kybStatus: string | null;
    registrationStatus: RegistrationStatus;
    planType: string | null;
    subscriptionStatus: string | null;
    createdAt: string;
}

const statusStyle: Record<RegistrationStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    SUSPENDED: "bg-red-50 text-red-700",
    REJECTED: "bg-slate-100 text-slate-600",
};

export default function B2BOrganizationsPage() {
    const [clients, setClients] = useState<B2BClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"ALL" | RegistrationStatus>("ALL");

    const loadClients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get<B2BClient[]>("/admin/b2b");
            setClients(data);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Could not load B2B clients");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        api.get<B2BClient[]>("/admin/b2b")
            .then(({ data }) => { if (active) setClients(data); })
            .catch((requestError: unknown) => {
                if (active) setError(requestError instanceof Error ? requestError.message : "Could not load B2B clients");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return clients.filter((client) => {
            const matchesStatus = status === "ALL" || client.registrationStatus === status;
            const matchesSearch = !query || [
                client.companyName, client.workEmail, client.contactNumber, client.taxId,
                client.adminName, client.adminEmail, String(client.organizationId),
                client.adminUserId ? String(client.adminUserId) : "",
            ].some((value) => value?.toLowerCase().includes(query));
            return matchesStatus && matchesSearch;
        });
    }, [clients, search, status]);

    const activeCount = clients.filter((client) => client.registrationStatus === "ACTIVE").length;
    const pendingKybCount = clients.filter((client) => client.kybStatus === "PENDING").length;
    const linkedWorkspaceCount = clients.filter((client) => client.workspaceId !== null).length;

    return (
        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">B2B Admin Users</h1>
                    <p className="text-sm text-slate-500 mt-1">Business workspace administrator accounts only.</p>
                </div>
                <button onClick={() => void loadClients()} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Admin Users", value: clients.length, icon: UserRound, tone: "text-blue-600 bg-blue-50" },
                    { label: "Active Organizations", value: activeCount, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
                    { label: "Pending KYB Reviews", value: pendingKybCount, icon: Clock, tone: "text-amber-600 bg-amber-50" },
                    { label: "Linked Workspaces", value: linkedWorkspaceCount, icon: Building2, tone: "text-violet-600 bg-violet-50" },
                ].map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900 mt-1">{value}</p></div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tone}`}><Icon size={20} /></div>
                    </div>
                ))}
            </section>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
                        {(["ALL", "ACTIVE", "PENDING", "SUSPENDED", "REJECTED"] as const).map((item) => (
                            <button key={item} onClick={() => setStatus(item)} className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${status === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                                {item === "ALL" ? `All (${clients.length})` : item.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, admin ID, PAN..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                {error ? (
                    <div className="p-10 text-center"><AlertCircle className="mx-auto text-red-500 mb-2" /><p className="text-sm text-red-600">{error}</p><button onClick={() => void loadClients()} className="mt-3 text-sm font-semibold text-blue-600">Try again</button></div>
                ) : loading ? (
                    <div className="p-12 text-center text-sm text-slate-400">Loading registered B2B clients...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                                <tr><th className="px-5 py-3">Organization</th><th className="px-5 py-3">Admin Account</th><th className="px-5 py-3">Workspace</th><th className="px-5 py-3">KYB / PAN</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? <tr><td colSpan={6} className="py-12 text-center text-slate-400">No B2B admin users match this filter.</td></tr> : filtered.map((client) => (
                                    <tr key={client.organizationId} className="hover:bg-slate-50/70 align-top">
                                        <td className="px-5 py-4"><p className="font-semibold text-slate-900">{client.companyName}</p><p className="text-xs text-slate-500 mt-1">Org ID: {client.organizationId}</p><p className="text-xs text-slate-400">{client.workEmail} · {client.contactNumber}</p></td>
                                        <td className="px-5 py-4">{client.adminUserId ? <><p className="font-semibold text-slate-800">{client.adminName}</p><p className="text-xs font-mono text-blue-700 mt-1">Admin User ID: {client.adminUserId}</p><p className="text-xs text-slate-400">Pro ID: {client.proUserId} · {client.adminEmail}</p></> : <span className="text-xs text-amber-600 font-medium">Admin not created</span>}</td>
                                        <td className="px-5 py-4">{client.workspaceId ? <><p className="font-medium text-slate-800">{client.workspaceName}</p><p className="text-xs text-slate-500 mt-1">Workspace ID: {client.workspaceId}</p><p className="text-xs text-slate-400">{client.primaryBranchLocation}</p></> : <span className="text-xs text-slate-400">Not created</span>}</td>
                                        <td className="px-5 py-4"><p className="font-mono text-xs text-slate-700">{client.taxId ?? "Not submitted"}</p>{client.kybStatus && <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700"><ShieldCheck size={12} /> {client.kybStatus}</span>}</td>
                                        <td className="px-5 py-4"><p className="text-xs font-semibold text-slate-700">{client.planType ?? "No plan"}</p><p className="text-xs text-slate-400 mt-1">{client.subscriptionStatus ?? "No subscription"}</p></td>
                                        <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[client.registrationStatus]}`}>{client.registrationStatus}</span><p className="text-xs text-slate-400 mt-2">Joined {new Date(client.createdAt).toLocaleDateString()}</p></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
