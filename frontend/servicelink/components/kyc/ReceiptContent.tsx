"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface ReceiptContentProps {
    referenceNumber: string;
    formattedDate: string;
    formattedTime: string;
    applicantName: string;
    applicantEmail: string;
}

export default function ReceiptContent({
                                           referenceNumber,
                                           formattedDate,
                                           formattedTime,
                                           applicantName,
                                           applicantEmail,
                                       }: ReceiptContentProps) {

    const qrValue = JSON.stringify({
        ref: referenceNumber,
        name: applicantName,
        date: `${formattedDate} ${formattedTime}`,
        verifiedBy: "ServiceLink Core Engine",
    });

    return (
        <div
            id="receipt-print-area"
            className="p-8 sm:p-12 w-full max-w-[794px] mx-auto"
            style={{
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
        >
            {/* Header Grid Layout */}
            <div className="flex justify-between items-start pb-6" style={{ borderBottom: "2px solid #1e3a8a" }}>
                {/*<div>*/}
                {/*    <h1 className="text-2xl font-bold tracking-tight text-[#1e3a8a]" style={{ color: "#1e3a8a" }}>ServiceLink</h1>*/}
                {/*    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">*/}
                {/*        Building Trust. Connecting Services.*/}
                {/*    </p>*/}
                {/*</div>*/}
                <div className="flex items-center gap-3">
                    <img
                        src="/images/SL.png"
                        alt="ServiceLink"
                        crossOrigin="anonymous"
                        className="h-10 w-auto object-contain"
                    />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#1e3a8a]" style={{ color: "#1e3a8a" }}>ServiceLink</h1>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                            Building Trust. Connecting Services.
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-widest" style={{ backgroundColor: "#1e3a8a" }}>
                        Official Receipt
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Document ID: {referenceNumber.replace("SVC-", "")}</p>
                </div>
            </div>

            {/* Hero Accent Bar Card */}
            <div className="my-6 p-4 rounded-r-lg flex justify-between items-center" style={{ backgroundColor: "#eef4ff", borderLeft: "4px solid #1e3a8a" }}>
                <div>
                    <p className="text-xs uppercase font-bold text-[#1e3a8a] tracking-wider">Application Status</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: "#1e293b" }}>Submitted successfully</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider" style={{ color: "#047857", backgroundColor: "#d1fae5", border: "1px solid #a7f3d0" }}>
                  Under Review
                </span>
            </div>

            {/* User Attributes Grid */}
            <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-[#e8683f] font-extrabold pb-2 mb-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    Applicant Information
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                        <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Full Legal Name</span>
                        <span className="font-semibold text-slate-800">{applicantName}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Email Address</span>
                        <span className="font-semibold text-slate-800 break-all">{applicantEmail}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Reference Number</span>
                        <span className="font-mono font-bold text-[#1e3a8a]" style={{ color: "#1e3a8a" }}>{referenceNumber}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Submission Timestamp</span>
                        <span className="font-semibold text-slate-800">{formattedDate} • {formattedTime}</span>
                    </div>
                </div>
            </div>

            {/* Subscription Framework Notice */}
            <div className="mb-8 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs uppercase tracking-wider text-[#1e3a8a] font-bold mb-2">Subscription & Trial Account Disclosures</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="text-slate-400 block font-medium">Allocated Rate Program</span>
                        <span className="font-semibold text-slate-700">30-Day Free Service Trial ($0.00 upfront)</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block font-medium">Post-Trial Renewal Options</span>
                        <span className="font-semibold text-slate-700">Flexible options on 1-Month, 3-Month, or 1-Year terms</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic leading-tight">
                    * No payment data is harvested during verification. Subscription provisioning begins instantly upon operational admin document sign-off.
                </p>
            </div>

            {/* Checklist Grid Matrix */}
            <div className="mb-8">
                <h3 className="text-xs uppercase tracking-widest text-[#e8683f] font-extrabold pb-2 mb-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    Verification Milestones
                </h3>
                <div className="space-y-2.5">
                    {[
                        { label: "Personal Info Validation", complete: true },
                        { label: "Professional Background Declaration", complete: true },
                        { label: "KYC Cryptographic Document Uploads", complete: true },
                        { label: "Manual Registry Check & Sign-off", complete: false },
                        { label: "Final 30-Day Free Trial Provisioning", complete: false },
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-md" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                            <span className="text-xs font-medium text-slate-700">{item.label}</span>
                            <div className="flex items-center gap-1.5">
                                {item.complete ? (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide" style={{ color: "#047857", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>Done</span>
                                ) : (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide" style={{ color: "#c2410c", backgroundColor: "#fff3ed", border: "1px solid #ffedd5" }}>Pending</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer System Verification Validation Badge */}
            <div className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-6" style={{ borderTop: "1px solid #e2e8f0" }}>
                <div className="text-center sm:text-left">
                    <p className="text-xs font-semibold text-slate-700">Thank you for choosing ServiceLink.</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm leading-relaxed">
                        This auto-generated receipt is a cryptographically trackable registration statement. For immediate issues, write directly to support@servicelink.com.
                    </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl p-3 shrink-0" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <QRCodeSVG value={qrValue} size={64} level="M" includeMargin={false} />
                    <div className="text-left">
                        <span className="text-[10px] uppercase font-bold text-[#1e3a8a] tracking-wider block" style={{ color: "#1e3a8a" }}>Digital Verification</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5 max-w-[120px] leading-tight">Scan with any standard device to verify token status.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}