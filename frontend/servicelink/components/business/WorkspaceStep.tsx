// "use client";

// import { useState } from "react";
// import { GitBranch } from "lucide-react";
// import api from "@/utils/axios";
// import { useBusinessSetup } from "@/hooks/useBusinessSetup";
// import { toast } from "react-toastify";

// const SERVICES = [
//   "HVAC",
//   "Electrical",
//   "Plumbing",
//   "Cleaning",
//   "Security",
//   "Landscaping",
//   "IT_SUPPORT",
//   "PEST_CONTROL",
// ];

// interface WorkspaceStepProps {
//   onContinue: () => void;
//   onBack: () => void;
// }

// type WorkspaceFormData = {
//   workspaceName: string;
//   primaryLocation: string;
//   preferredServices: string[];
// };

// export default function WorkspaceStep({
//   onContinue,
//   onBack,
// }: WorkspaceStepProps) {
//   const { data, setWorkspace } = useBusinessSetup();

//   // ─────────────────────────────────────────────────────
//   // State
//   // ─────────────────────────────────────────────────────
//   const [formData, setFormData] = useState<WorkspaceFormData>({
//     workspaceName: "",
//     primaryLocation: "",
//     preferredServices: [],
//   });

//   const [loading, setLoading] = useState(false);

//   // ─────────────────────────────────────────────────────
//   // Handle Input Change
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
//   // Toggle Services
//   // ─────────────────────────────────────────────────────
//   const toggleService = (service: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       preferredServices: prev.preferredServices.includes(service)
//         ? prev.preferredServices.filter((s) => s !== service)
//         : [...prev.preferredServices, service],
//     }));
//   };

//   // ─────────────────────────────────────────────────────
//   // Submit Form
//   // ─────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       if (!data.organizationId) {
//         toast.error("Organization ID not found");
//         return;
//       }

//       const payload = {
//         name: formData.workspaceName,
//         primaryBranchLocation: formData.primaryLocation,
//         organizationId: data.organizationId,
//       };

//       const response = await api.post("/business/workspace", payload);

//       console.log("Workspace Created:", response.data);

//       // Save to context
//       setWorkspace(response.data.id, formData.workspaceName);

//       onContinue();
//     } catch (error) {
//       console.error("Create Workspace Error:", error);
//       toast.error("Failed to create workspace");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="flex items-start gap-4 mb-8">
//         <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
//           <GitBranch size={22} className="text-[#1e3a8a]" />
//         </div>

//         <div>
//           <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
//             Step 2 of 5
//           </p>

//           <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
//             Set up your workspace
//           </h1>

//           <p className="text-gray-500 text-sm mt-1">
//             This becomes the home base for your operations team.
//           </p>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="space-y-5">
//         {/* Row 1 */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//           {/* Workspace Name */}
//           <div>
//             <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//               Workspace name <span className="text-red-500">*</span>
//             </label>

//             <input
//               type="text"
//               name="workspaceName"
//               value={formData.workspaceName}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
//               placeholder="Enter workspace name"
//             />
//           </div>

//           {/* Primary Location */}
//           <div>
//             <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
//               Primary branch location <span className="text-red-500">*</span>
//             </label>

//             <input
//               type="text"
//               name="primaryLocation"
//               value={formData.primaryLocation}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
//               placeholder="Enter primary branch address"
//             />
//           </div>
//         </div>

//         {/* Preferred Services */}
//         <div>
//           <label className="block text-sm font-semibold text-[#1e3a8a] mb-1">
//             Preferred services
//           </label>

//           <p className="text-sm text-gray-500 mb-3">
//             Pick the categories you manage most often.
//           </p>

//           <div className="flex flex-wrap gap-2">
//             {SERVICES.map((service) => {
//               const isSelected = formData.preferredServices.includes(service);

//               return (
//                 <button
//                   key={service}
//                   type="button"
//                   onClick={() => toggleService(service)}
//                   className={`
//                     px-4 py-2 rounded-full border text-sm font-medium transition
//                     ${
//                       isSelected
//                         ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
//                         : "bg-white text-[#1e3a8a] border-gray-300 hover:border-[#1e3a8a]/60"
//                     }
//                   `}
//                 >
//                   {service.replace("_", " ")}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Divider */}
//       <div className="border-t border-gray-200 my-7" />

//       {/* Footer */}
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
import { GitBranch } from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

const SERVICES = [
  "HVAC",
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Security",
  "Landscaping",
  "IT_SUPPORT",
  "PEST_CONTROL",
];

interface WorkspaceStepProps {
  onContinue: (workspaceId: string, workspaceName: string) => void;
  onBack: () => void;
  organizationId: string | null;
}

type WorkspaceFormData = {
  workspaceName: string;
  primaryLocation: string;
  preferredServices: string[];
};

const INITIAL_FORM: WorkspaceFormData = {
  workspaceName: "",
  primaryLocation: "",
  preferredServices: [],
};

export default function WorkspaceStep({
  onContinue,
  onBack,
  organizationId,
}: WorkspaceStepProps) {
  const [formData, setFormData] = useState<WorkspaceFormData>(INITIAL_FORM);
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

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(service)
        ? prev.preferredServices.filter((s) => s !== service)
        : [...prev.preferredServices, service],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    if (!formData.primaryLocation.trim()) {
      toast.error("Primary branch location is required");
      return;
    }

    if (!organizationId) {
      toast.error(
        "Organization ID not found - please go back and create an organization",
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.workspaceName,
        primaryBranchLocation: formData.primaryLocation,
        organizationId,
      };

      const response = await api.post("/business/workspace", payload);

      if (!response.data?.id) {
        toast.error("Failed to get workspace ID");
        return;
      }

      onContinue(String(response.data.id), formData.workspaceName.trim());
    } catch (error) {
      console.error("Create Workspace Error:", error);
      toast.error("Failed to create workspace");
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
          <GitBranch size={22} className="text-[#1e3a8a]" />
        </div>

        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 2 of 5
          </p>

          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Set up your workspace
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            This becomes the home base for your operations team.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Workspace name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="workspaceName"
              value={formData.workspaceName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="Enter workspace name"
            />
          </div>

          {/* Primary Location */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Primary branch location <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="primaryLocation"
              value={formData.primaryLocation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="Enter primary branch address"
            />
          </div>
        </div>

        {/* Preferred Services */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1">
            Preferred services
          </label>

          <p className="text-sm text-gray-500 mb-3">
            Pick the categories you manage most often.
          </p>

          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => {
              const isSelected = formData.preferredServices.includes(service);

              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                    isSelected
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                      : "bg-white text-[#1e3a8a] border-gray-300 hover:border-[#1e3a8a]/60"
                  }`}
                >
                  {service.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-7" />

      {/* Footer */}
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
