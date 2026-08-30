"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { toast } from "react-toastify";
import {
  Briefcase,
  Clock,
  AlertTriangle,
  User,
  Users,
  X,
  CheckCircle2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Plus,
  ArrowRight,
  Trash2,
  Check,
  Star
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  proJobService,
  ProJobTicketResponse,
  ProJobDetailResponse,
  ProEligibleProviderResponse
} from "@/services/proJobService";
import dynamic from "next/dynamic";
import api from "@/utils/axios";

const MapPicker = dynamic(() => import("@/components/business/jobs/MapPicker"), { ssr: false });

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

const CATEGORIES = ["Electrical", "Plumbing", "HVAC", "Cleaning", "Pest Control", "Security"];

const statusStyle: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-600 border border-amber-100",
  ASSIGNING: "bg-blue-50 text-blue-600 border border-blue-100",
  PARTIALLY_ASSIGNED: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  ASSIGNED: "bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20",
  IN_PROGRESS: "bg-purple-50 text-purple-600 border border-purple-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-600 border border-rose-100",
  UNFULFILLED: "bg-slate-50 text-slate-600 border border-slate-100",
};

function JobTicketsPageContent() {
  const { role } = useSelector((state: RootState) => state.proSession);
  const isWritable = role === "ADMIN" || role === "MANAGER";

  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id");

  const [jobs, setJobs] = useState<ProJobTicketResponse[]>([]);
  const [selectedJob, setSelectedJob] = useState<ProJobDetailResponse | null>(null);
  const [eligibleProviders, setEligibleProviders] = useState<ProEligibleProviderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Job Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [catalogs, setCatalogs] = useState<{ id: number; categoryName: string; subServiceName: string }[]>([]);
  const [activeCategories, setActiveCategories] = useState<{ id: number; name: string }[]>([]);
  const [workforceRequirements, setWorkforceRequirements] = useState<{
    skill: string;
    workersRequired: number;
    pricingModel: "PER_JOB" | "PER_DAY" | "PER_HOUR" | "PER_SQ_FT";
    price: number;
  }[]>([
    { skill: "Electrical", workersRequired: 1, pricingModel: "PER_JOB", price: 1000 }
  ]);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.3240]);

  const [createForm, setCreateForm] = useState({
    title: "",
    serviceCatalogId: 1, // Default fallback id
    category: "Electrical",
    service: "",
    workersRequired: 1,
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    instructions: "",
    pricingModel: "PER_JOB" as "PER_JOB" | "PER_DAY",
    businessPrice: "",
  });

  // Assign dropdown state
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Load catalogs and categories
  const loadCatalogs = async () => {
    try {
      const [catalogRes, categoryRes] = await Promise.all([
        api.get<any[]>("/providers/catalog"),
        api.get<any[]>("/providers/categories")
      ]);
      const mapped = catalogRes.data.map((item: any) => ({
        id: item.id,
        categoryName: item.category?.name ?? "",
        subServiceName: item.subServiceName ?? "",
      }));
      setCatalogs(mapped);
      setActiveCategories(categoryRes.data);
    } catch (err) {
      console.error("Failed to load catalog/category items:", err);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Load jobs list
  const loadJobs = async () => {
    setLoading(true);
    try {
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const res = await proJobService.getJobs(filter);
      setJobs(res.content || []);
    } catch (err) {
      console.error("Failed to load jobs list:", err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.address;
      if (!addr) throw new Error("No address found");
      const parts = [
        addr.road || addr.pedestrian,
        addr.neighbourhood || addr.suburb,
        addr.city || addr.town || addr.village,
      ].filter(Boolean);
      const readableAddress = parts.join(", ") || data.display_name;
      setCreateForm((prev) => ({ ...prev, location: readableAddress }));
    } catch (e) {
      setCreateForm((prev) => ({ ...prev, location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    }
  };

  const parseInstructionsAndWorkforce = (instructionsText: string | null) => {
    if (!instructionsText) return { instructions: "", requirements: [] };
    const parts = instructionsText.split("\n\n---WORKFORCE_REQUIREMENTS---\n");
    if (parts.length > 1) {
      try {
        const requirements = JSON.parse(parts[1]) as {
          skill: string;
          workersRequired: number;
          pricingModel?: "PER_JOB" | "PER_DAY" | "PER_HOUR" | "PER_SQ_FT";
          price?: number;
        }[];
        const normalized = requirements.map(r => ({
          skill: r.skill,
          workersRequired: r.workersRequired,
          pricingModel: r.pricingModel || "PER_JOB",
          price: r.price || 0
        }));
        return { instructions: parts[0], requirements: normalized };
      } catch (e) {
        return { instructions: instructionsText, requirements: [] };
      }
    }
    return { instructions: instructionsText, requirements: [] };
  };

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  // Load specific job detail on mount if id parameter exists
  useEffect(() => {
    if (initialId) {
      handleOpenDetails(parseInt(initialId));
      // Remove query parameter cleanly
      router.replace("/dashboard/business/jobs");
    }
  }, [initialId]);

  const handleOpenDetails = async (jobId: number) => {
    setDetailLoading(true);
    try {
      const details = await proJobService.getJobDetails(jobId);
      setSelectedJob(details);
      // Fetch eligible provider candidates
      const candidates = await proJobService.getEligibleProviders(jobId);
      setEligibleProviders(candidates);
    } catch (err) {
      console.error("Failed to load job details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignProvider = async (providerId: number, requiredSkill: string) => {
    if (!selectedJob) return;
    try {
      await api.post(`/pro/jobs/${selectedJob.id}/assign`, null, {
        params: { providerId, requiredSkill }
      });
      // Keeping modal open so manager can fulfill multiple roles
      await handleOpenDetails(selectedJob.id);
      loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign provider.");
    }
  };

  const handleUnassignProvider = async (providerId: number) => {
    if (!selectedJob) return;
    if (!confirm("Are you sure you want to unassign this provider?")) return;
    try {
      await proJobService.unassignProvider(selectedJob.id, providerId);
      await handleOpenDetails(selectedJob.id);
      loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unassign provider.");
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;
    if (!confirm("Confirm job completion? This will generate the final invoice and calculate provider SLA metrics.")) return;
    try {
      await proJobService.completeJob(selectedJob.id);
      await handleOpenDetails(selectedJob.id);
      loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to complete job.");
    }
  };

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleEditJob = (job: any) => {
    setEditingJobId(job.id);
    const parsed = parseInstructionsAndWorkforce(job.instructions);
    
    if (job.latitude && job.longitude) {
      setMapCenter([job.latitude, job.longitude]);
    }
    
    const isMulti = job.category === "Multiple Services" || parsed.requirements.length > 1;

    setCreateForm({
      title: job.title,
      serviceCatalogId: job.serviceCatalogId || 1,
      category: isMulti ? "Multiple Services" : (parsed.requirements[0]?.skill || job.category),
      service: job.service || "",
      workersRequired: job.workersRequired || 1,
      startDate: job.startDate || "",
      endDate: job.endDate || "",
      startTime: job.startTime?.substring(0, 5) || "09:00",
      endTime: job.endTime?.substring(0, 5) || "17:00",
      location: job.location || "",
      instructions: parsed.instructions,
      pricingModel: job.pricingModel || "PER_JOB",
      businessPrice: job.businessPrice?.toString() || "",
    });

    if (isMulti) {
      setWorkforceRequirements(parsed.requirements as any);
    } else {
      const singleReq = parsed.requirements[0] || {
        skill: job.category,
        workersRequired: job.workersRequired,
        pricingModel: job.pricingModel,
        price: job.businessPrice
      };
      setWorkforceRequirements([{
        skill: singleReq.skill,
        workersRequired: singleReq.workersRequired,
        pricingModel: (singleReq.pricingModel || "PER_JOB") as any,
        price: singleReq.price || 0
      }]);
    }
    setIsCreateOpen(true);
  };

  const handleDeleteClick = (jobId: number) => {
    setDeleteTargetId(jobId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/pro/jobs/${deleteTargetId}`);
      toast.success("Job ticket deleted successfully.");
      setDeleteTargetId(null);
      loadJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete job ticket.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const firstSkill = createForm.category === "Multiple Services"
        ? (workforceRequirements[0]?.skill ?? "Electrical")
        : createForm.category;

      const matchedCatalog = catalogs.find(
        (c) => c.categoryName.toLowerCase() === firstSkill.toLowerCase()
      );
      const catalogId = matchedCatalog ? matchedCatalog.id : 1;

      const totalWorkers = createForm.category === "Multiple Services"
        ? workforceRequirements.reduce((sum, req) => sum + req.workersRequired, 0)
        : createForm.workersRequired;

      const requirementsPayload = createForm.category === "Multiple Services"
        ? workforceRequirements.map((req) => ({
            skill: req.skill,
            workersRequired: req.workersRequired,
            pricingModel: req.pricingModel,
            price: req.price,
            providerEarning: req.price
          }))
        : [{
            skill: createForm.category,
            workersRequired: createForm.workersRequired,
            pricingModel: createForm.pricingModel,
            price: parseFloat(createForm.businessPrice) || 0,
            providerEarning: parseFloat(createForm.businessPrice) || 0
          }];

      const instructionsPayload = `${createForm.instructions}\n\n---WORKFORCE_REQUIREMENTS---\n${JSON.stringify(requirementsPayload)}`;

      const totalBusinessPrice = createForm.category === "Multiple Services"
        ? workforceRequirements.reduce((sum, req) => sum + (Number(req.price) || 0) * (req.workersRequired || 1), 0)
        : parseFloat(createForm.businessPrice) || 0;

      const payload = {
        serviceCatalogId: catalogId,
        title: createForm.title,
        workersRequired: totalWorkers,
        startDate: createForm.startDate,
        endDate: createForm.endDate || createForm.startDate,
        startTime: createForm.startTime + (createForm.startTime.length === 5 ? ":00" : ""),
        endTime: createForm.endTime + (createForm.endTime.length === 5 ? ":00" : ""),
        location: createForm.location,
        latitude: mapCenter[0],
        longitude: mapCenter[1],
        instructions: instructionsPayload,
        pricingModel: createForm.category === "Multiple Services" ? (workforceRequirements[0]?.pricingModel || "PER_JOB") : createForm.pricingModel,
        businessPrice: totalBusinessPrice,
        providerEarning: totalBusinessPrice * 0.85,
      };

      if (editingJobId) {
        await api.put(`/pro/jobs/${editingJobId}`, payload);
        toast.success("Job ticket updated successfully.");
      } else {
        await proJobService.createJob(payload);
        toast.success("Job ticket published successfully.");
      }

      setIsCreateOpen(false);
      setEditingJobId(null);
      loadJobs();

      // Reset form
      const defaultCategory = activeCategories[0]?.name || "Electrical";
      setCreateForm({
        title: "",
        serviceCatalogId: 1,
        category: defaultCategory,
        service: "",
        workersRequired: 1,
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        location: "",
        instructions: "",
        pricingModel: "PER_JOB",
        businessPrice: "",
      });
      setWorkforceRequirements([{ skill: defaultCategory, workersRequired: 1, pricingModel: "PER_JOB", price: 1000 }]);
      setShowMap(false);
      setMapCenter([27.7172, 85.3240]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save job ticket.");
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { instructions: cleanInstructions, requirements: parsedRequirements } = selectedJob
    ? parseInstructionsAndWorkforce(selectedJob.instructions)
    : { instructions: "", requirements: [] as { skill: string; workersRequired: number; pricingModel: "PER_JOB" | "PER_DAY" | "PER_HOUR" | "PER_SQ_FT"; price: number }[] };

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Tickets Console</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage corporate dispatch workflows, provider assignments, and real-time geofenced QR check-ins.</p>
        </div>
        {isWritable && (
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{ backgroundColor: NAVY }}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition-all duration-200"
          >
            <Plus size={18} />
            Create Job Ticket
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tickets, services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900"
          />
        </div>

        {/* Status Filter tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "REQUESTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border shrink-0 ${
                statusFilter === status
                  ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
          <p className="text-gray-400 text-sm font-medium">Fetching job tickets from server...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
          <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-slate-700 font-bold text-lg">No Job Tickets Found</p>
          <p className="text-slate-400 text-sm mt-1">Try resetting filters or request a new job ticket.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const parsed = parseInstructionsAndWorkforce(job.instructions);
            return (
              <div
                key={job.id}
                onClick={() => handleOpenDetails(job.id)}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[240px] group border-l-4"
                style={{ borderLeftColor: job.status === "COMPLETED" ? "#10b981" : job.status === "IN_PROGRESS" ? "#8b5cf6" : "#e8683f" }}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#1e3a8a] bg-[#1e3a8a]/5 px-2 py-0.5 rounded">
                      {job.reference}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusStyle[job.status] || "bg-gray-50 text-gray-500"}`}>
                      {job.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base mt-3 line-clamp-1 group-hover:text-[#1e3a8a] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 truncate">
                    {parsed.requirements.length > 0
                      ? parsed.requirements.map(r => r.skill).join(", ")
                      : `${job.service} · ${job.category}`}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 font-medium">
                    <MapPin size={13} className="text-[#e8683f]" />
                    <span className="line-clamp-1">{job.location}</span>
                  </div>

                  {job.assignments && job.assignments.length > 0 && (
                    <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Providers:</span>
                      <div className="flex items-center gap-1.5">
                        {job.assignments.map((p) => (
                          <div key={p.providerId} className="relative w-6 h-6" title={`${p.fullName} (${p.status})`}>
                            {p.profilePictureUrl ? (
                              <img
                                src={p.profilePictureUrl}
                                alt={p.fullName}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-[9px] border border-slate-200">
                                {p.fullName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center text-[5px] border border-white shadow-xs"
                              style={{
                                backgroundColor: p.status === "ACCEPTED" ? "#10b981" : p.status === "REJECTED" ? "#ef4444" : "#f59e0b",
                                color: "#ffffff"
                              }}
                            >
                              {p.status === "ACCEPTED" ? <Check size={5} className="stroke-[4]" /> : p.status === "REJECTED" ? <X size={5} className="stroke-[4]" /> : <Clock size={5} className="stroke-[4]" />}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="border-t border-gray-50 pt-3 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <Calendar size={13} className="text-[#1e3a8a]" />
                      <span className="truncate max-w-[125px]">{job.startDate} to {job.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-900 font-black text-sm">
                      <span>Rs. {job.businessPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(job.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      View
                    </button>
                    {isWritable && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-600 border border-amber-200 bg-amber-50/50 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(job.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-600 border border-red-200 bg-red-50/50 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Side Drawer Modal */}
      {selectedJob && (() => {
        const activeAssignments = selectedJob.assignments.filter((p: any) => p.status !== "REJECTED");
        return (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-scale-in p-6 relative">
              
              {/* Header info */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-[#1e3a8a] bg-[#1e3a8a]/5 px-2.5 py-0.5 rounded">
                        {selectedJob.reference}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${statusStyle[selectedJob.status]}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mt-2">{selectedJob.title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{selectedJob.service} · {selectedJob.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Specs parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 mb-6">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Business Price</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">Rs. {selectedJob.businessPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workers Req.</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedJob.workersRequired} Tech</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Range</p>
                    <p className="text-[11px] font-bold text-slate-800 mt-0.5 leading-snug">{selectedJob.startDate} to {selectedJob.endDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                    <p className="text-sm font-bold text-[#1e3a8a] truncate mt-0.5">{selectedJob.location}</p>
                  </div>
                </div>

                {/* Workforce Required & Pricing */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Workforce Required</h4>
                  <div className="space-y-2">
                    {parsedRequirements.length > 0 ? (
                      parsedRequirements.map((req, idx) => (
                        <div key={idx} className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-sm font-semibold text-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-800 font-extrabold">{req.skill}</span>
                            <span className="bg-[#1e3a8a]/10 text-[#1e3a8a] px-2.5 py-0.5 rounded text-xs">
                              {req.workersRequired} worker{req.workersRequired > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/40 text-xs text-slate-500">
                            <span>Pricing: {req.pricingModel === "PER_JOB" ? "Per Job" : req.pricingModel === "PER_DAY" ? "Per Day" : req.pricingModel === "PER_HOUR" ? "Per Hour" : "Per Sq. Ft."}</span>
                            <span className="font-extrabold text-[#e8683f]">Rs. {req.price?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-sm font-semibold text-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-800 font-extrabold">{selectedJob.category}</span>
                          <span className="bg-[#1e3a8a]/10 text-[#1e3a8a] px-2.5 py-0.5 rounded text-xs">
                            {selectedJob.workersRequired} worker{selectedJob.workersRequired > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/40 text-xs text-slate-500">
                          <span>Pricing: {selectedJob.pricingModel === "PER_JOB" ? "Per Job" : selectedJob.pricingModel === "PER_DAY" ? "Per Day" : selectedJob.pricingModel === "PER_HOUR" ? "Per Hour" : "Per Sq. Ft."}</span>
                          <span className="font-extrabold text-[#e8683f]">Rs. {selectedJob.businessPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Instructions</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                    {cleanInstructions || "No special instructions provided."}
                  </p>
                </div>

                {/* QR Verification Target */}
                <div className="mb-6 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">QR Verification Code</h4>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 max-w-xs">
                    <div className="bg-[#1e3a8a]/5 p-2 rounded-lg">
                      <FileText className="text-[#1e3a8a]" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold">QR Token value</p>
                      <p className="text-sm font-bold text-slate-900 font-mono">jt_qr_{selectedJob.id}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Providers */}
                <div className="mb-6 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Providers ({activeAssignments.length}/{selectedJob.workersRequired})</h4>
                    {activeAssignments.length < selectedJob.workersRequired && isWritable && (
                      <div>
                        <button
                          onClick={() => setIsAssignOpen(true)}
                          style={{ borderColor: NAVY, color: NAVY }}
                          className="text-xs font-bold border px-2.5 py-1 rounded-lg hover:bg-[#1e3a8a]/5 transition-colors flex items-center gap-1"
                        >
                          Assign Candidate
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {selectedJob.assignments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No providers assigned yet.</p>
                    ) : (
                      selectedJob.assignments.map((p) => (
                        <div key={p.providerId} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9">
                              {p.profilePictureUrl ? (
                                <img
                                  src={p.profilePictureUrl}
                                  alt={p.fullName}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs border border-slate-200">
                                  {p.fullName.substring(0,2).toUpperCase()}
                                </div>
                              )}
                              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border-2 border-white shadow-sm"
                                    style={{
                                      backgroundColor: p.status === "ACCEPTED" ? "#10b981" : p.status === "REJECTED" ? "#ef4444" : "#f59e0b",
                                      color: "#ffffff"
                                    }}
                              >
                                {p.status === "ACCEPTED" ? <Check size={8} className="stroke-[3]" /> : p.status === "REJECTED" ? <X size={8} className="stroke-[3]" /> : <Clock size={8} className="stroke-[3]" />}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{p.fullName}</p>
                              <p className="text-xs text-slate-400">
                                <span className="font-semibold text-[#1e3a8a]">{p.requiredSkill || selectedJob.category}</span>
                              </p>
                            </div>
                          </div>
                          {isWritable && (
                            <button
                              onClick={() => handleUnassignProvider(p.providerId)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              {/* Attendance Checkins */}
              <div className="mb-6 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Live Geofence Check-in status</h4>
                <div className="space-y-2.5">
                  {selectedJob.attendance.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No attendance records generated.</p>
                  ) : (
                    selectedJob.attendance.map((a) => (
                      <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">{a.providerName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.status === "PRESENT" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : a.status === "LATE" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>Check-in: {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : "Pending"}</span>
                          </div>
                          {a.distanceFromJob !== null && (
                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                              <MapPin size={11} className="text-[#e8683f]" />
                              <span>{Math.round(a.distanceFromJob)}m distance</span>
                            </div>
                          )}
                        </div>
                        {a.rejectionReason && (
                          <div className="flex items-center gap-1.5 p-1.5 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-600 font-semibold">
                            <AlertTriangle size={11} />
                            <span>{a.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Complete Job button */}
            <div className="border-t border-slate-100 pt-4 flex gap-4">
              {selectedJob.status === "IN_PROGRESS" && (
                <button
                  onClick={handleCompleteJob}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  <CheckCircle2 size={18} />
                  Complete Job & Generate Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })()}

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-800">{editingJobId ? "Edit Pro Job Ticket" : "New Pro Job Ticket"}</h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingJobId(null);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Room Air Conditioner Repair"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category Mode</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCat = activeCategories[0]?.name || "Electrical";
                        setCreateForm({ ...createForm, category: defaultCat });
                        setWorkforceRequirements([{ skill: defaultCat, workersRequired: createForm.workersRequired, pricingModel: createForm.pricingModel, price: parseFloat(createForm.businessPrice) || 0 }]);
                      }}
                      className={`w-1/2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        createForm.category !== "Multiple Services" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Single Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCat = activeCategories[0]?.name || "Electrical";
                        setCreateForm({ ...createForm, category: "Multiple Services" });
                        setWorkforceRequirements([{ skill: defaultCat, workersRequired: 1, pricingModel: "PER_JOB", price: 1000 }]);
                      }}
                      className={`w-1/2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        createForm.category === "Multiple Services" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Multiple Categories
                    </button>
                  </div>

                  {createForm.category !== "Multiple Services" ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Category</label>
                      <select
                        value={createForm.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, category: val });
                          setWorkforceRequirements([{ skill: val, workersRequired: createForm.workersRequired, pricingModel: createForm.pricingModel, price: parseFloat(createForm.businessPrice) || 0 }]);
                        }}
                        className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                      >
                        {activeCategories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workforce Required</label>
                      <div className="space-y-2">
                        {workforceRequirements.map((req, idx) => (
                          <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl mb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase text-slate-400">Requirement #{idx + 1}</span>
                              {workforceRequirements.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWorkforceRequirements(workforceRequirements.filter((_, i) => i !== idx));
                                  }}
                                  className="text-red-550 hover:text-red-700 text-xs font-bold flex items-center gap-0.5"
                                >
                                  <Trash2 size={13} /> Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-5">
                                <select
                                  value={req.skill}
                                  onChange={(e) => {
                                    const updated = [...workforceRequirements];
                                    updated[idx].skill = e.target.value;
                                    setWorkforceRequirements(updated);
                                  }}
                                  className="w-full border border-gray-200 px-2 py-1.5 rounded-lg text-xs font-medium"
                                >
                                  {activeCategories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min={1}
                                  placeholder="Qty"
                                  value={req.workersRequired}
                                  onChange={(e) => {
                                    const updated = [...workforceRequirements];
                                    updated[idx].workersRequired = parseInt(e.target.value) || 1;
                                    setWorkforceRequirements(updated);
                                  }}
                                  className="w-full border border-gray-200 px-2 py-1.5 rounded-lg text-xs font-medium text-center"
                                />
                              </div>
                              <div className="col-span-3">
                                <select
                                  value={req.pricingModel}
                                  onChange={(e) => {
                                    const updated = [...workforceRequirements];
                                    updated[idx].pricingModel = e.target.value as any;
                                    setWorkforceRequirements(updated);
                                  }}
                                  className="w-full border border-gray-200 px-1 py-1.5 rounded-lg text-[10px] font-medium"
                                >
                                  <option value="PER_JOB">Per Job</option>
                                  <option value="PER_DAY">Per Day</option>
                                  <option value="PER_HOUR">Per Hour</option>
                                  <option value="PER_SQ_FT">Per Sq. Ft.</option>
                                </select>
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="Price"
                                  value={req.price || ""}
                                  onChange={(e) => {
                                    const updated = [...workforceRequirements];
                                    updated[idx].price = parseFloat(e.target.value) || 0;
                                    setWorkforceRequirements(updated);
                                  }}
                                  className="w-full border border-gray-200 px-2 py-1.5 rounded-lg text-xs font-medium text-right"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const defaultCat = activeCategories[0]?.name || "Electrical";
                            setWorkforceRequirements([...workforceRequirements, { skill: defaultCat, workersRequired: 1, pricingModel: "PER_JOB", price: 1000 }]);
                          }}
                          className="flex items-center gap-1.5 text-[#e8683f] font-bold text-xs hover:opacity-85 mt-1"
                        >
                          <Plus size={14} /> Add Requirement
                        </button>
                      </div>
                      <div className="mt-2 text-xs font-bold text-slate-500">
                        Total Workers: {workforceRequirements.reduce((sum, req) => sum + req.workersRequired, 0)}
                      </div>
                    </div>
                  )}
                </div>

                {createForm.category !== "Multiple Services" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workers Required</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      required
                      value={createForm.workersRequired}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setCreateForm({ ...createForm, workersRequired: val });
                        setWorkforceRequirements([{ skill: createForm.category, workersRequired: val, pricingModel: createForm.pricingModel, price: parseFloat(createForm.businessPrice) || 0 }]);
                      }}
                      className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                    />
                  </div>
                )}
              </div>

              {createForm.category !== "Multiple Services" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pricing Model</label>
                    <select
                      value={createForm.pricingModel}
                      onChange={(e) => setCreateForm({ ...createForm, pricingModel: e.target.value as any })}
                      className="w-full border border-gray-200 px-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                    >
                      <option value="PER_JOB">Per Job</option>
                      <option value="PER_DAY">Per Day</option>
                      <option value="PER_HOUR">Per Hour</option>
                      <option value="PER_SQ_FT">Per Sq. Ft.</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Price Budget (Rs)</label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="e.g. 5000"
                      value={createForm.businessPrice}
                      onChange={(e) => setCreateForm({ ...createForm, businessPrice: e.target.value })}
                      className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Time</label>
                  <input
                    type="time"
                    required
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hotel Annapurna, Thamel, Kathmandu"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="flex-1 border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            const { latitude, longitude } = position.coords;
                            setMapCenter([latitude, longitude]);
                            await reverseGeocode(latitude, longitude);
                            alert("Location fetched successfully!");
                          },
                          () => {
                            alert("Unable to fetch current location.");
                          }
                        );
                      } else {
                        alert("Geolocation is not supported by your browser.");
                      }
                    }}
                    className="px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-slate-600 transition-colors whitespace-nowrap"
                  >
                    Use Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${showMap ? "bg-[#1e3a8a] text-white border-[#1e3a8a]" : "border-gray-200 text-slate-600 hover:bg-gray-50"}`}
                  >
                    Pin on Map
                  </button>
                </div>
                {showMap && (
                  <div className="mt-2">
                    <MapPicker
                      center={mapCenter}
                      onChange={async (lat, lng) => {
                        setMapCenter([lat, lng]);
                        await reverseGeocode(lat, lng);
                      }}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Coordinates: {mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Special Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise scope details for the contractor..."
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                />
              </div>

              <div className="flex gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingJobId(null);
                  }}
                  className="w-1/2 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: NAVY }}
                  className="w-1/2 text-white py-3 rounded-xl font-extrabold shadow-lg hover:opacity-90 transition-opacity"
                >
                  {editingJobId ? "Save Changes" : "Publish Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Provider Modal */}
      {isAssignOpen && selectedJob && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Assign Providers</h3>
                <p className="text-xs text-slate-400">Fulfill workforce roles for this job</p>
              </div>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {(() => {
                const parsed = parseInstructionsAndWorkforce(selectedJob.instructions);
                const requirements = parsed.requirements.length > 0
                  ? parsed.requirements
                  : [{ skill: selectedJob.category, workersRequired: selectedJob.workersRequired, pricingModel: selectedJob.pricingModel || "PER_JOB", price: selectedJob.businessPrice || 0 }];

                return requirements.map((req) => {
                  const acceptedCount = selectedJob.assignments.filter(
                    (a) => a.requiredSkill?.toLowerCase() === req.skill.toLowerCase() && a.status === "ACCEPTED"
                  ).length;
                  const pendingCount = selectedJob.assignments.filter(
                    (a) => a.requiredSkill?.toLowerCase() === req.skill.toLowerCase() && a.status === "PENDING"
                  ).length;
                  const totalSelectedForSkill = acceptedCount + pendingCount;

                  return (
                    <div key={req.skill} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{req.skill}</span>
                        <span className="text-xs font-bold text-[#1e3a8a]">
                          Required: {req.workersRequired} | Sent/Accepted: {totalSelectedForSkill}
                        </span>
                      </div>

                      {/* Current assignments for this skill */}
                      <div className="space-y-1.5 mb-3">
                        {selectedJob.assignments
                          .filter((a) => (a.requiredSkill || selectedJob.category).toLowerCase() === req.skill.toLowerCase())
                          .map((a) => (
                            <div key={a.providerId} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 text-xs">
                              <span className="font-semibold text-slate-700">{a.fullName}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                a.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                a.status === "REJECTED" ? "bg-red-50 text-red-600 border border-red-100" :
                                "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}>
                                {a.status || "ACCEPTED"}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Select and Send request */}
                      {totalSelectedForSkill < req.workersRequired && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Available Candidates</p>
                          <div className="space-y-1.5">
                            {eligibleProviders.filter(
                              (p) => (p.primaryCategoryName || "").toLowerCase() === req.skill.toLowerCase()
                            ).length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic py-1">No eligible providers found for this skill.</p>
                            ) : (
                              eligibleProviders
                                .filter((p) => (p.primaryCategoryName || "").toLowerCase() === req.skill.toLowerCase())
                                .map((p) => {
                                  const isAlreadyAssigned = selectedJob.assignments.some(
                                    (a) => a.providerId === p.providerId && a.status !== "REJECTED"
                                  );
                                  if (isAlreadyAssigned) return null;
                                  return (
                                    <div
                                      key={p.providerId}
                                      className="w-full p-2.5 rounded-lg bg-white border border-slate-100 flex items-center justify-between transition-colors mt-1 text-xs"
                                    >
                                      <div>
                                        <p className="font-bold text-slate-800">{p.fullName}</p>
                                        <p className="text-[10px] text-slate-400">{p.businessName || p.location}</p>
                                      </div>
                                      <button
                                        onClick={() => handleAssignProvider(p.providerId, req.skill)}
                                        className="text-[10px] text-[#e8683f] font-bold border border-[#e8683f]/20 bg-[#e8683f]/5 px-2.5 py-1 rounded-md hover:bg-[#e8683f] hover:text-white transition-all shadow-sm"
                                      >
                                        Send Request
                                      </button>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsAssignOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-505 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Job Ticket</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to delete this job ticket? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="w-1/2 border border-gray-200 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 bg-red-600 hover:bg-red-750 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobTicketsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
        <p className="text-gray-400 text-sm font-medium">Loading Job Tickets Console...</p>
      </div>
    }>
      <JobTicketsPageContent />
    </Suspense>
  );
}