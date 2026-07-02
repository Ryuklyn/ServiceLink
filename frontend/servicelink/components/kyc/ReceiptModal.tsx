"use client";

import React, { useState } from "react";
import { X, FileDown, ShieldCheck } from "lucide-react";
import ReceiptContent from "./ReceiptContent";
import { generateReceiptPDF } from "./ReceiptPDF";

interface ReceiptModalProps {
    onClose: () => void;
    referenceNumber: string;
    formattedDate: string;
    formattedTime: string;
    applicantName: string;
    applicantEmail: string;
}

export default function ReceiptModal({
                                         onClose,
                                         referenceNumber,
                                         formattedDate,
                                         formattedTime,
                                         applicantName,
                                         applicantEmail,
                                     }: ReceiptModalProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        await generateReceiptPDF("receipt-print-area", referenceNumber);
        setIsDownloading(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 flex flex-col my-auto overflow-hidden">

                {/* Control Action Bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#1e3a8a]">
                        <ShieldCheck className="w-5 h-5 text-[#e8683f]" />
                        <span className="font-serif font-bold text-slate-700 text-sm">Application Document Preview</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-[#1e3a8a] hover:bg-[#162a63] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <FileDown className="w-4 h-4" />
                            {isDownloading ? "Generating..." : "Download PDF"}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scaled Preview Frame */}
                <div className="flex-1 bg-slate-100 p-4 sm:p-6 max-h-[70vh] overflow-y-auto shadow-inner">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 transform scale-100 origin-top">
                        <ReceiptContent
                            referenceNumber={referenceNumber}
                            formattedDate={formattedDate}
                            formattedTime={formattedTime}
                            applicantName={applicantName}
                            applicantEmail={applicantEmail}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}