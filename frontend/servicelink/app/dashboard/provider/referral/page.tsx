"use client";

import { useState } from "react";
import {
    Copy,
    Link,
    Share2,
    CheckCircle,
    Circle,
    CheckCheck,
} from "lucide-react";
import {FaWhatsapp} from "react-icons/fa";

const referralData = {
    code: "SL-RUKESH-2026",
    inviteLink: "https://servicelink.np/joi...",
    progress: 3,
    total: 5,
    freeMonthsEarned: 0,
    message:
        "Hey! I use ServiceLink to get more customers. Join using my code SL-BHUMIKA-2026 and get your first month discounted! 🔗",
};

const FacebookIcon = ({ size = 15 }: { size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = ({ size = 15 }: { size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

const referralHistory = [
    {
        name: "Hari Sharma",
        category: "Electrician",
        joinedDate: "June 5, 2026",
        kycStatus: "APPROVED",
        paymentStatus: "PENDING",
        counts: false,
    },
    {
        name: "Ram Magar",
        category: "Plumber",
        joinedDate: "June 3, 2026",
        kycStatus: "APPROVED",
        paymentStatus: "PAID",
        counts: true,
    },
    {
        name: "Sita Devi",
        category: "House Cleaner",
        joinedDate: "June 8, 2026",
        kycStatus: "PENDING",
        paymentStatus: "UNPAID",
        counts: false,
    },
];

export default function ReferralPage() {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralData.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText("https://servicelink.np/join?ref=SL-BHUMIKA-2026");
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const progressPercent = (referralData.progress / referralData.total) * 100;

    return (
        <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
            {/* Hero Banner */}
            <div
                className="relative overflow-hidden px-6 py-10 md:px-12 md:py-12 space-y-5 rounded-2xl mt-5"
                style={{ backgroundColor: "#1e3a8a" }}
            >
                {/* Decorative circles */}
                <div
                    className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10"
                    style={{
                        backgroundColor: "#ffffff",
                        transform: "translate(30%, -30%)",
                    }}
                />
                <div
                    className="absolute right-16 top-8 w-40 h-40 rounded-full opacity-10"
                    style={{ backgroundColor: "#ffffff" }}
                />

                <div className="relative z-10 max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                        Refer providers.
                        <br />
                        Earn free months.
                    </h1>
                    <p className="text-blue-200 text-sm md:text-base max-w-sm leading-relaxed mb-8">
                        Grow the ServiceLink community in Nepal and get rewarded. For every
                        5 verified providers you invite, your next subscription month is on
                        us.
                    </p>

                    {/* Progress Card */}
                    <div className="bg-white rounded-xl p-5 max-w-sm shadow-md">
                        <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-800 text-sm">
                    Your Progress
                </span>
                            <div className="flex items-baseline gap-0.5">
                    <span
                        className="text-2xl font-bold"
                        style={{ color: "#e8683f" }}
                    >
                        {referralData.progress}
                    </span>
                                <span className="text-gray-400 text-base font-medium">
                        /{referralData.total}
                    </span>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                            <div
                                className="h-2.5 rounded-full transition-all duration-500"
                                style={{
                                    width: `${progressPercent}%`,
                                    backgroundColor: "#e8683f",
                                }}
                            />
                        </div>
                        <p className="text-gray-400 text-xs">
                            42 providers in Kathmandu earned a free month last cycle.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-5">
                {/* Share Link + How it Works */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Share Your Link */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="font-semibold text-gray-800 text-base mb-4">
                            Share Your Link
                        </h2>

                        {/* Referral Code + Invite Link */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">
                                    Referral Code
                                </label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-800 flex-1">
                    {referralData.code}
                  </span>
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <Copy size={13} />
                                        <span>{copiedCode ? "Copied!" : "Copy"}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block">
                                    Invite Link
                                </label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                  <span className="text-sm text-gray-500 flex-1 truncate">
                    {referralData.inviteLink}
                  </span>
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <Link size={13} />
                                        <span>{copiedLink ? "Copied!" : "Copy"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pre-written Message */}
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 mb-1.5 block">
                                Pre-written Message
                            </label>
                            <div className="border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-sm text-gray-700 leading-relaxed min-h-[64px]">
                                {referralData.message}
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex gap-3 flex-wrap">
                            <button
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "#25D366" }}
                            >
                                <FaWhatsapp size={15} />
                                Share on WhatsApp
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                <FacebookIcon size={15} />
                                Facebook
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity">
                                <InstagramIcon size={15} />
                                Instagram
                            </button>
                        </div>
                    </div>

                    {/* How it Works + Free Months */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
                            <h2 className="font-semibold text-gray-800 text-base mb-4">
                                How it works
                            </h2>
                            <div className="space-y-4">
                                {[
                                    {
                                        step: 1,
                                        title: "Share your link",
                                        desc: "Send your invite link or code to other service providers.",
                                    },
                                    {
                                        step: 2,
                                        title: "They join & get approved",
                                        desc: "They must complete KYC verification and activate their account.",
                                    },
                                    {
                                        step: 3,
                                        title: "You get rewarded",
                                        desc: "After 5 successful referrals, your next month's subscription is free.",
                                    },
                                ].map(({ step, title, desc }) => (
                                    <div key={step} className="flex gap-3 items-start">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                            style={{ backgroundColor: "#e8683f" }}
                                        >
                                            {step}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                                {title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Free Months Earned */}
                        <div
                            className="rounded-xl border p-4 shadow-sm"
                            style={{
                                backgroundColor: "#fff7f4",
                                borderColor: "#fcd5c2",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "#fde8dc" }}
                                >
                                    <CheckCheck size={18} style={{ color: "#e8683f" }} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 leading-none mb-0.5">
                                        Free months earned
                                    </p>
                                    <p
                                        className="text-2xl font-bold leading-none"
                                        style={{ color: "#e8683f" }}
                                    >
                                        {referralData.freeMonthsEarned}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Refer 2 more to earn your first!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Referral History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800 text-base">
                            Referral History
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Name
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Category
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Joined Date
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    KYC Status
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Payment Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {referralHistory.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {row.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{row.category}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {row.joinedDate}
                                    </td>
                                    <td className="px-6 py-4">
                      <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                              row.kycStatus === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {row.kycStatus}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                                row.paymentStatus === "PAID"
                                    ? "border-gray-300 text-gray-700 bg-white"
                                    : row.paymentStatus === "PENDING"
                                        ? "border-gray-300 text-gray-600 bg-white"
                                        : "border-gray-300 text-gray-600 bg-white"
                            }`}
                        >
                          {row.paymentStatus}
                        </span>
                                            {row.counts && (
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                            <CheckCircle size={12} />
                            Counts
                          </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold">Note:</span> Referrals only count
                            towards your goal when the invited provider has both approved KYC
                            and a paid subscription.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}