// "use client";

// import { useState } from "react";
// import { Building2, ChevronDown } from "lucide-react";
// import api from "@/utils/axios";
// import { useBusinessSetup } from "@/hooks/useBusinessSetup";
// import { toast } from "react-toastify";

// interface OrganizationStepProps {
//   onContinue: () => void;
//   onBack: () => void;
// }

// type OrganizationFormData = {
//   companyName: string;
//   businessType: string;
//   companySize: string;
//   workEmail: string;
//   contactNumber: string;
// };

// export default function OrganizationStep({
//   onContinue,
//   onBack,
// }: OrganizationStepProps) {
//   const { setOrganization } = useBusinessSetup();

//   // ─────────────────────────────────────────────────────
//   // State
//   // ─────────────────────────────────────────────────────
//   const [formData, setFormData] = useState<OrganizationFormData>({
//     companyName: "",
//     businessType: "",
//     companySize: "",
//     workEmail: "",
//     contactNumber: "",
//   });

//   const [loading, setLoading] = useState(false);

//   // ─────────────────────────────────────────────────────
//   // Handle Change
//   // ─────────────────────────────────────────────────────
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//   ) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ─────────────────────────────────────────────────────
//   // Submit Form
//   // ─────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       const response = await api.post("/business/organization", formData);

//       console.log("Organization Created:", response.data);

//       // Save to context
//       setOrganization(response.data.id, formData.companyName);

//       // Pass organizationId to parent
//       onContinue();
//     } catch (error) {
//       console.error("Create Organization Error:", error);
//       toast.error("Failed to create organization");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="flex items-start gap-4 mb-8">
//         <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
//           <Building2 size={22} className="text-[#1e3a8a]" />
//         </div>

//         <div>
//           <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
//             Step 1 of 5
//           </p>

//           <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
//             Tell us about your organization
//           </h1>

//           <p className="text-gray-500 text-sm mt-1">
//             Just the essentials — you can refine the rest later.
//           </p>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="space-y-5">
//         {/* Row 1 */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//           {/* Company Name */}
//           <div>
//             <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//               Company name <span className="text-red-500">*</span>
//             </label>

//             <input
//               type="text"
//               name="companyName"
//               value={formData.companyName}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
//               placeholder="Enter Company Name"
//             />
//           </div>

//           {/* Business Type */}
//           <div>
//             <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//               Business type <span className="text-red-500">*</span>
//             </label>

//             <div className="relative">
//               <select
//                 name="businessType"
//                 value={formData.businessType}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition bg-white"
//               >
//                 <option value="">Select organization type</option>

//                 {/* Must match Java enum */}
//                 <option value="OFFICE">Office / Corporate</option>
//                 <option value="HOTEL">Hotel / Hospitality</option>
//                 <option value="RESTAURANT">Restaurant / Cafe</option>
//                 <option value="APARTMENT">Apartment / Housing</option>
//                 <option value="HOSPITAL">Hospital / Clinic</option>
//                 <option value="SCHOOL">School / College</option>
//                 <option value="RETAIL">Retail Store / Supermarket</option>
//                 <option value="FACILITY_MANAGEMENT">Facility Management</option>
//                 <option value="PROPERTY_MANAGEMENT">Property Management</option>
//                 <option value="CONSTRUCTION">Construction</option>
//                 <option value="FACTORY">Factory / Warehouse</option>
//                 <option value="OTHER">Other</option>
//               </select>

//               <ChevronDown
//                 size={16}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Row 2 */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//           {/* Company Size */}
//           <div>
//             <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//               Company size <span className="text-red-500">*</span>
//             </label>

//             <div className="relative">
//               <select
//                 name="companySize"
//                 value={formData.companySize}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition bg-white"
//               >
//                 <option value="">Choose size</option>

//                 {/* Must match Java enum */}
//                 <option value="SIZE_1_10">1–10 employees</option>
//                 <option value="SIZE_11_50">11–50 employees</option>
//                 <option value="SIZE_51_200">51–200 employees</option>
//                 <option value="SIZE_201_1000">201–1000 employees</option>
//                 <option value="SIZE_1000_PLUS">1000+ employees</option>
//               </select>

//               <ChevronDown
//                 size={16}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               />
//             </div>
//           </div>

//           {/* Work Email */}
//           <div>
//             <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//               Work email <span className="text-red-500">*</span>
//             </label>

//             <input
//               type="email"
//               name="workEmail"
//               value={formData.workEmail}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
//               placeholder="ops@company.com"
//             />
//           </div>
//         </div>

//         {/* Contact Number */}
//         <div>
//           <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//             Contact number <span className="text-red-500">*</span>
//           </label>

//           <input
//             type="tel"
//             name="contactNumber"
//             value={formData.contactNumber}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
//             placeholder="Enter Contact No."
//           />
//         </div>
//       </div>

//       {/* Divider */}
//       <div className="border-t border-gray-200 my-7" />

//       {/* Footer Actions */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={onBack}
//           className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition"
//         >
//           <span>←</span> Back
//         </button>

//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="flex items-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold px-7 py-3 rounded-lg transition disabled:opacity-50"
//         >
//           {loading ? "Submitting..." : "Continue"}
//           <span>→</span>
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

interface OrganizationStepProps {
  onContinue: (orgId: string) => void;
  onBack: () => void;
}

type OrganizationFormData = {
  companyName: string;
  businessType: string;
  companySize: string;
  workEmail: string;
  contactNumber: string;
};

const INITIAL_FORM: OrganizationFormData = {
  companyName: "",
  businessType: "",
  companySize: "",
  workEmail: "",
  contactNumber: "",
};

export default function OrganizationStep({
  onContinue,
  onBack,
}: OrganizationStepProps) {
  const [formData, setFormData] = useState<OrganizationFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.post("/business/organization", formData);
      onContinue(response.data.id);
    } catch (error) {
      console.error("Create Organization Error:", error);
      toast.error("Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
          <Building2 size={22} className="text-[#1e3a8a]" />
        </div>

        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 1 of 5
          </p>

          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Tell us about your organization
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Just the essentials — you can refine the rest later.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Company name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="Enter Company Name"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Business type <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition bg-white"
              >
                <option value="">Select organization type</option>
                <option value="OFFICE">Office / Corporate</option>
                <option value="HOTEL">Hotel / Hospitality</option>
                <option value="RESTAURANT">Restaurant / Cafe</option>
                <option value="APARTMENT">Apartment / Housing</option>
                <option value="HOSPITAL">Hospital / Clinic</option>
                <option value="SCHOOL">School / College</option>
                <option value="RETAIL">Retail Store / Supermarket</option>
                <option value="FACILITY_MANAGEMENT">Facility Management</option>
                <option value="PROPERTY_MANAGEMENT">Property Management</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="FACTORY">Factory / Warehouse</option>
                <option value="OTHER">Other</option>
              </select>

              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Company Size */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Company size <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition bg-white"
              >
                <option value="">Choose size</option>
                <option value="SIZE_1_10">1–10 employees</option>
                <option value="SIZE_11_50">11–50 employees</option>
                <option value="SIZE_51_200">51–200 employees</option>
                <option value="SIZE_201_1000">201–1000 employees</option>
                <option value="SIZE_1000_PLUS">1000+ employees</option>
              </select>

              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Work email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="workEmail"
              value={formData.workEmail}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="ops@company.com"
            />
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
            Contact number <span className="text-red-500">*</span>
          </label>

          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
            placeholder="Enter Contact No."
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-7" />

      {/* Footer Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition"
        >
          <span>←</span> Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold px-7 py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Continue"}
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
