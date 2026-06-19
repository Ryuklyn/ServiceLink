import { CheckCircle2, IdCard, CreditCard, Receipt, Image as ImageIcon, RefreshCw } from "lucide-react";
import { FaShieldAlt } from "react-icons/fa";

const documents = [
    { id: 1, icon: IdCard, name: "Citizenship Certificate", meta: "NP-XXX-XXXX", uploadedDate: "May 28, 2024" },
    { id: 2, icon: CreditCard, name: "PAN Card", meta: "123456789", uploadedDate: "May 28, 2024" },
    { id: 3, icon: Receipt, name: "Address Proof", meta: "Utility Bill", uploadedDate: "May 28, 2024" },
    { id: 4, icon: ImageIcon, name: "Profile Photo", meta: "Profile Image", uploadedDate: "May 28, 2024" },
];

const checklist = [
    { label: "Personal Information", sub: "Your basic personal details" },
    { label: "ID Verification", sub: "Citizenship No: NP-XXX-XXXX" },
    { label: "Phone Verification", sub: "+977 98******21" },
    { label: "Email Verification", sub: "bhu****@gmail.com" },
    { label: "Address Verification", sub: "Baneshwor, Kathmandu" },
    { label: "Service Category", sub: "Electrician" },
    { label: "Admin Approval", sub: "Verified by ServiceLink Team" },
];

export default function ProfileKYC() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">KYC Verification</h2>
                <p className="text-sm text-gray-500">Manage your identity verification and documents.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">KYC Status</h3>
                        {/*<span className="mt-3 h-3 w-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">*/}
                        {/*      <FaShieldAlt/>*/}
                        {/*      Approved*/}
                        {/*    </span>*/}
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <FaShieldAlt className="h-3.5 w-3.5" />
                    KYC Approved
                    </span>
                        <p className="mt-3 text-sm text-gray-600">Your KYC was approved on June 1, 2026</p>
                        <p className="mt-1 text-sm text-gray-500">Next renewal due: June 1, 2027</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">Documents</h3>
                        <div className="mt-4 space-y-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                                            <doc.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                                <span className="text-xs font-medium text-green-600">Verified</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Uploaded on {doc.uploadedDate}</p>
                                        </div>
                                    </div>
                                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#1e3a8a] hover:bg-gray-50">
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">Verification Checklist</h3>
                    <div className="mt-4 space-y-3">
                        {checklist.map((item) => (
                            <div key={item.label} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.sub}</p>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Verified
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Update Banner */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a8a]/10">
                        <RefreshCw className="h-4 w-4 text-[#1e3a8a]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Need to update your information?</p>
                        <p className="text-xs text-gray-500">If any of your information has changed, request an update for review.</p>
                    </div>
                </div>
                <button className="w-fit rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]/90">
                    Request Update
                </button>
            </div>
        </div>
    );
}