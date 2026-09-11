"use client";

import { useState, useEffect } from "react";
import { GitBranch } from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

interface WorkspaceStepProps {
  onContinue: (workspaceId: string, workspaceName: string) => void;
  onBack: () => void;
  organizationId: string | null;
  workspaceId: string | null; // present when resuming a previous session
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
                                        workspaceId,
                                      }: WorkspaceStepProps) {
  const [formData, setFormData] = useState<WorkspaceFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  // Fetch active categories from the database
  useEffect(() => {
    api
        .get<Array<{ name: string }>>("/providers/categories")
        .then((res) => {
            const catNames = res.data.map((c) => c.name);
            setCategories(catNames);
        })
        .catch((err) => {
            console.error("Failed to load categories:", err);
            // Fallback to static list if API request fails to avoid blocking registration
            setCategories([
                "HVAC",
                "Electrical",
                "Plumbing",
                "Cleaning",
                "Security",
                "Landscaping",
                "IT_SUPPORT",
                "PEST_CONTROL",
            ]);
        })
        .finally(() => {
            setLoadingCategories(false);
        });
  }, []);

  // Resume: prefill from the DB if this workspace already exists
  useEffect(() => {
    if (!workspaceId) return;
    api
        .get(`/business/workspace/${workspaceId}`)
        .then((res) => {
          setFormData({
            workspaceName: res.data.name ?? "",
            primaryLocation: res.data.primaryBranchLocation ?? "",
            preferredServices: res.data.preferredServices ?? [],
          });
        })
        .catch(() => {
          // resume lookup failed — non-fatal, form just stays blank
        });
  }, [workspaceId]);

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

      // NOTE: previously this payload omitted preferredServices even though
      // the UI collects it — WorkspaceMapper.toEntity() reads it, so it was
      // silently being saved as null/empty. Fixed here.
      const payload = {
        name: formData.workspaceName,
        primaryBranchLocation: formData.primaryLocation,
        preferredServices: formData.preferredServices,
        organizationId,
      };

      const response = await api.post("/business/workspace", payload);

      if (!response.data?.id) {
        toast.error("Failed to get workspace ID");
        return;
      }

      onContinue(String(response.data.id), formData.workspaceName.trim());
    } catch (error: unknown) {
      console.error("Create Workspace Error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
          err?.response?.data?.message ?? "Failed to create workspace",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full">
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

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1">
              Preferred services
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Pick the categories you manage most often.
            </p>
            {loadingCategories ? (
              <p className="text-xs text-gray-400">Loading services...</p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400">No services available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((service) => {
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
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 my-7" />

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