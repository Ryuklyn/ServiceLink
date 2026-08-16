"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, XCircle, Clock } from "lucide-react";

interface VerifyResponse {
    referenceNumber: string;
    fullName: string;
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    submittedAt: string;
}

export default function VerifyPage() {
    const { ref } = useParams<{ ref: string }>();
    const [data, setData] = useState<VerifyResponse | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kyc/verify/${ref}`)
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(setData)
            .catch(() => setError(true));
    }, [ref]);

    if (error) return <div className="p-12 text-center text-sm text-red-500">Invalid or expired reference number.</div>;
    if (!data) return <div className="p-12 text-center text-sm text-slate-500">Verifying...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-sm w-full text-center">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-[#1e3a8a]" />
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">ServiceLink Verification</p>
                <h1 className="text-lg font-bold mt-1 text-slate-800">{data.fullName}</h1>
                <p className="text-xs text-slate-400 font-mono mt-1">{data.referenceNumber}</p>
                <span className="inline-block mt-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {data.status.replace("_", " ")}
                </span>
                <p className="text-xs text-slate-400 mt-4">Submitted {new Date(data.submittedAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
}