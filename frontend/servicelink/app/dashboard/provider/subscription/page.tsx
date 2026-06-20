"use client";

import { useState } from "react";
import { Calendar, RefreshCw, Star, Check, ChevronRight } from "lucide-react";
import Image from "next/image";

const billingHistory = [
    { invoice: "INV-2026-#6", date: "June 1, 2026", plan: "Monthly", amount: "Rs. 500", method: "eSewa", status: "Paid" },
    { invoice: "INV-2026-#5", date: "May 1, 2026", plan: "Monthly", amount: "Rs. 500", method: "Khalti", status: "Paid" },
    { invoice: "INV-2026-#4", date: "April 1, 2026", plan: "Monthly", amount: "Rs. 500", method: "eSewa", status: "Paid" },
    { invoice: "INV-2026-#3", date: "March 1, 2026", plan: "Monthly", amount: "Rs. 500", method: "Khalti", status: "Paid" },
    { invoice: "INV-2026-#2", date: "February 1, 2026", plan: "Monthly", amount: "Rs. 500", method: "eSewa", status: "Paid" },
];

const methodIcon = (method: string) => {
    switch (method) {
        case "eSewa":
            return (
                <img
                    src="/images/esewa.png"
                    alt="eSewa"
                    className="h-10 w-full object-contain"
                />
            );

        case "Khalti":
            return (
                <img
                    src="/images/khalti.png"
                    alt="Khalti"
                    className="h-10 w-full object-contain"
                />
            );
    }
};

const methodBadgeColor = (method: string) => {
    if (method === "eSewa") return "bg-green-50 text-green-700 border-green-200";
    if (method === "Khalti") return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-red-50 text-red-700 border-red-200";
};

export default function SubscriptionPage() {
    const [autoRenew, setAutoRenew] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [selectedPayment, setSelectedPayment] = useState("esewa");

    return (
        <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-800">Subscription & Billing</h1>
                    <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            Active
          </span>
                </div>

                {/* Current Plan Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-1.5 mb-2 rounded px-2 py-0.5">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#e8683f" }}></div>
                                    <span className="text-xs font-medium text-gray-700">Monthly Plan</span>
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#e8683f", color: "white" }}>Active</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Calendar size={11} /> Started: June 1, 2026</span>
                                <span className="flex items-center gap-1"><Calendar size={11} /> Expires: June 30, 2026</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold" style={{ color: "#1e3a8a" }}>18</div>
                            <div className="text-xs text-gray-500">days remaining</div>
                        </div>
                    </div>

                    {/* Billing period progress */}
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Billing period</span>
                            <span>18 / 30 days left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: "40%", backgroundColor: "#e8683f" }}></div>
                        </div>
                    </div>

                </div>

                {/* Choose a Plan */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Choose a Plan</h2>
                    <div className="grid grid-cols-3 gap-3">

                        {/* Monthly */}
                        <div
                            onClick={() => setSelectedPlan("monthly")}
                            className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedPlan === "monthly" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                            {selectedPlan === "monthly" && (
                                <span className="absolute -top-2.5 left-3 text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "#e8683f", color: "white" }}>Current</span>
                            )}
                            <p className="text-xs font-semibold text-gray-700 mb-1">Monthly</p>
                            <p className="text-base font-bold" style={{ color: "#1e3a8a" }}>Rs. 500</p>
                            <p className="text-xs text-gray-400 mb-2">/ month</p>
                            <p className="text-xs text-gray-400 mb-3">Rs. 500/month</p>
                            <div className="space-y-1.5">
                                {["Unlimited booking requests", "Customer messaging via ServiceLink", "Earnings dashboard & analytics", "Referral program access", "Priority search listing"].map((f) => (
                                    <div key={f} className="flex items-start gap-1.5">
                                        <Check size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-600 leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quarterly */}
                        <div
                            onClick={() => setSelectedPlan("quarterly")}
                            className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedPlan === "quarterly" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                            <p className="text-xs font-semibold text-gray-700 mb-1">Quarterly</p>
                            <p className="text-base font-bold" style={{ color: "#1e3a8a" }}>Rs. 1200</p>
                            <p className="text-xs text-gray-400 mb-1">/ 3 months</p>
                            <p className="text-xs font-semibold mb-2" style={{ color: "#e8683f" }}>Save Rs. 300/year</p>
                            <div className="space-y-1.5">
                                {["Unlimited booking requests", "Customer messaging via ServiceLink", "Earnings dashboard & analytics", "Referral program access", "Priority search listing"].map((f) => (
                                    <div key={f} className="flex items-start gap-1.5">
                                        <Check size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-gray-600 leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Yearly */}
                        <div
                            onClick={() => setSelectedPlan("yearly")}
                            className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedPlan === "yearly" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                            <span className="absolute -top-2.5 right-3 text-xs font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: "#e8683f" }}>Best Value</span>
                            <p className="text-xs font-semibold text-gray-700 mb-1">Yearly</p>
                            <p className="text-base font-bold" style={{ color: "#1e3a8a" }}>Rs. 4000</p>
                            <p className="text-xs text-gray-400 mb-1">/ year</p>
                            <p className="text-xs text-gray-500 line-through mb-0.5">Rs. 333/month</p>
                            <p className="text-xs font-semibold mb-2" style={{ color: "#e8683f" }}>Save Rs. 2000/year</p>
                            <div className="space-y-1.5">
                                {["Unlimited booking requests", "Customer messaging via ServiceLink", "Earnings dashboard & analytics", "Referral program access", "Priority search listing", "Includes priority placement"].map((f, i) => (
                                    <div key={f} className="flex items-start gap-1.5">
                                        <Check size={11} className={`mt-0.5 flex-shrink-0 ${i === 5 ? "text-orange-400" : "text-green-500"}`} />
                                        <span className={`text-xs leading-tight ${i === 5 ? "font-semibold" : "text-gray-600"}`} style={i === 5 ? { color: "#e8683f" } : {}}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-semibold text-gray-800">Payment Method</h2>
                    </div>
                    <div className="flex gap-3 mb-3">
                        {/* eSewa */}
                        <button
                            onClick={() => setSelectedPayment("esewa")}
                            className={`w-28 h-16 flex items-center justify-center rounded-xl border-2 transition-all ${
                                selectedPayment === "esewa"
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <img
                                src="/images/esewa.png"
                                alt="eSewa"
                                className="max-h-20 max-w-[100%] object-contain"
                            />
                        </button>

                        {/* Khalti */}
                        <button
                            onClick={() => setSelectedPayment("khalti")}
                            className={`w-28 h-16 flex items-center justify-center rounded-xl border-2 transition-all ${
                                selectedPayment === "khalti"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <img
                                src="/images/khalti.png"
                                alt="Khalti"
                                className="max-h-20 max-w-[100%] object-contain"
                            />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Payments are processed securely. ServiceLink does not store your payment credentials.</p>
                </div>

                {/* Free Months from Referrals */}
                <div className="rounded-xl border p-5 shadow-sm" style={{ backgroundColor: "#f0f4ff", borderColor: "#c7d5f8" }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Star size={15} className="text-blue-500" />
                        <h2 className="text-sm font-semibold" style={{ color: "#1e3a8a" }}>Free Months from Referrals</h2>
                    </div>
                    <div className="text-3xl font-bold mb-1" style={{ color: "#1e3a8a" }}>0</div>
                    <p className="text-xs text-gray-600 mb-2">free months earned</p>
                    <p className="text-xs text-gray-600 mb-3">
                        You've completed <strong>3</strong> of <strong>5</strong> referrals needed for your first free month.{" "}
                        <strong style={{ color: "#e8683f" }}>2 more to go!</strong>
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: "60%", backgroundColor: "#1e3a8a" }}></div>
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Billing History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Invoice</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Plan</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Method</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {billingHistory.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-xs text-gray-500 font-mono">{row.invoice}</td>
                                    <td className="px-5 py-3 text-xs text-gray-600">{row.date}</td>
                                    <td className="px-5 py-3 text-xs text-gray-600">{row.plan}</td>
                                    <td className="px-5 py-3 text-xs font-semibold text-gray-800">{row.amount}</td>
                                    <td className="px-5 py-3">
                      {/*<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-semibold ${methodBadgeColor(row.method)}`}>*/}
                      {/*  {methodIcon(row.method)}*/}
                      {/*    {row.method}*/}
                      {/*</span>*/}
                                        <span
                                            className={`inline-flex items-center justify-center min-w-[70px] h-6 rounded border ${methodBadgeColor(
                                                row.method
                                            )}`}
                                        >
                                      {methodIcon(row.method)}
                                    </span>
                                    </td>
                                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-xs font-semibold">
                        {row.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cancel Subscription */}
                <div className="flex justify-end pb-4">
                    <button className="px-5 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                        Cancel Subscription
                    </button>
                </div>

            </div>
        </div>
    );
}