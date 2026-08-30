"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Image as ImageIcon, RefreshCw } from "lucide-react";
import { FaShieldAlt } from "react-icons/fa";
import { providerKycApi, type ProviderKycDetail } from "@/lib/api/providerKycApi";

const formatDate = (value: string | null) =>
    value ? new Intl.DateTimeFormat("en-NP", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)) : "—";

const statusStyle: Record<ProviderKycDetail["status"], string> = {
    APPROVED: "border-green-200 bg-green-50 text-green-700",
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    UNDER_REVIEW: "border-blue-200 bg-blue-50 text-blue-700",
    REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export default function ProfileKYC() {
    const [kyc, setKyc] = useState<ProviderKycDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        providerKycApi.getMyKyc()
            .then((data) => { if (!cancelled) setKyc(data); })
            .catch((err: { message?: string }) => { if (!cancelled) setError(err.message ?? "Could not load KYC details."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading KYC details…</div>;
    if (error || !kyc) return <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">{error ?? "KYC details are unavailable."}</div>;

    const verified = kyc.status === "APPROVED";
    return (
        <div className="space-y-6">
            <div><h2 className="text-lg font-bold text-gray-900">KYC Verification</h2><p className="text-sm text-gray-500">Your submitted identity documents and verification status.</p></div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">KYC Status</h3>
                        <span className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle[kyc.status]}`}><FaShieldAlt className="h-3.5 w-3.5" />{kyc.status.replace(/_/g, " ")}</span>
                        <p className="mt-3 text-sm text-gray-600">Submitted on {formatDate(kyc.submittedAt)}</p>
                        {kyc.reviewedAt && <p className="mt-1 text-sm text-gray-500">Reviewed on {formatDate(kyc.reviewedAt)}</p>}
                        {kyc.reviewNotes && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{kyc.reviewNotes}</p>}
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">Documents</h3>
                        <div className="mt-4 space-y-3">
                            {kyc.documents.length === 0 ? <p className="text-sm text-gray-500">No KYC documents are available.</p> : kyc.documents.map((document) => (
                                <div key={`${document.name}-${document.url}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                                    <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">{document.name.toLowerCase().includes("photo") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-medium text-gray-900">{document.name}</span><span className={`text-xs font-medium ${verified ? "text-green-600" : "text-amber-600"}`}>{verified ? "Verified" : kyc.status.replace(/_/g, " ")}</span></div><p className="text-xs text-gray-400">Uploaded on {formatDate(kyc.submittedAt)}</p></div></div>
                                    <a href={document.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#1e3a8a] hover:bg-gray-50">View</a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-gray-900">Verification Checklist</h3><div className="mt-4 space-y-3">{[
                    { label: "KYC application", sub: `Submitted on ${formatDate(kyc.submittedAt)}` },
                    { label: "Identity documents", sub: `${kyc.documents.length} document${kyc.documents.length === 1 ? "" : "s"} submitted` },
                    { label: "Admin review", sub: kyc.reviewedAt ? `Reviewed on ${formatDate(kyc.reviewedAt)}` : "Awaiting review" },
                ].map((item) => <div key={item.label} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3"><div className="flex items-start gap-3"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${verified ? "text-green-500" : "text-gray-300"}`} /><div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-400">{item.sub}</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[kyc.status]}`}>{kyc.status.replace(/_/g, " ")}</span></div>)}</div></div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a8a]/10"><RefreshCw className="h-4 w-4 text-[#1e3a8a]" /></div><div><p className="text-sm font-semibold text-gray-900">Need to update your information?</p><p className="text-xs text-gray-500">Contact ServiceLink support to request a KYC update.</p></div></div></div>
        </div>
    );
}
