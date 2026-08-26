"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
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
import {
  proJobService,
  ProJobTicketResponse,
  ProJobDetailResponse,
  ProEligibleProviderResponse
} from "@/services/proJobService";

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
  const [createForm, setCreateForm] = useState({
    title: "",
    serviceCatalogId: 1, // Default fallback id
    category: "Electrical",
    service: "",
    workersRequired: 1,
    scheduledDate: "",
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    instructions: "",
    pricingModel: "PER_JOB" as "PER_JOB" | "PER_DAY",
    businessPrice: "",
  });

  // Assign dropdown state
  const [isAssignOpen, setIsAssignOpen] = useState(false);

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

  const handleAssignProvider = async (providerId: number) => {
    if (!selectedJob) return;
    try {
      await proJobService.assignProvider(selectedJob.id, providerId);
      setIsAssignOpen(false);
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Setup payload matching CreateProJobTicketRequest structure
      const payload = {
        serviceCatalogId: createForm.serviceCatalogId,
        title: createForm.title,
        workersRequired: createForm.workersRequired,
        scheduledDate: createForm.scheduledDate,
        startTime: createForm.startTime + ":00",
        endTime: createForm.endTime + ":00",
        location: createForm.location,
        latitude: 27.7172, // Kathmandu center
        longitude: 85.3240,
        instructions: createForm.instructions,
        pricingModel: createForm.pricingModel,
        businessPrice: parseFloat(createForm.businessPrice),
        providerEarning: parseFloat(createForm.businessPrice) * 0.85, // 15% platform commission
      };

      await proJobService.createJob(payload);
      setIsCreateOpen(false);
      // Reset form
      setCreateForm({
        title: "",
        serviceCatalogId: 1,
        category: "Electrical",
        service: "",
        workersRequired: 1,
        scheduledDate: "",
        startTime: "09:00",
        endTime: "17:00",
        location: "",
        instructions: "",
        pricingModel: "PER_JOB",
        businessPrice: "",
      });
      loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create job ticket.");
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Tickets Console</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage corporate dispatch workflows, provider assignments, and real-time geofenced QR check-ins.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          style={{ backgroundColor: NAVY }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition-all duration-200"
        >
          <Plus size={18} />
          Create Job Ticket
        </button>
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
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleOpenDetails(job.id)}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-56 group border-l-4"
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
                <p className="text-xs text-slate-400 font-medium mt-1">{job.service} · {job.category}</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 font-medium">
                  <MapPin size={13} className="text-[#e8683f]" />
                  <span className="line-clamp-1">{job.location}</span>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Calendar size={13} className="text-[#1e3a8a]" />
                  <span>{job.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-900 font-black text-sm">
                  <span>Rs. {job.businessPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Side Drawer Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in p-6 relative">
            
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Date</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedJob.scheduledDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="text-sm font-bold text-[#1e3a8a] truncate mt-0.5">{selectedJob.location}</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Instructions</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                  {selectedJob.instructions || "No special instructions provided."}
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Providers ({selectedJob.assignments.length}/{selectedJob.workersRequired})</h4>
                  {selectedJob.assignments.length < selectedJob.workersRequired && (
                    <div className="relative">
                      <button
                        onClick={() => setIsAssignOpen(!isAssignOpen)}
                        style={{ borderColor: NAVY, color: NAVY }}
                        className="text-xs font-bold border px-2.5 py-1 rounded-lg hover:bg-[#1e3a8a]/5 transition-colors flex items-center gap-1"
                      >
                        Assign Candidate
                      </button>
                      
                      {/* Assign Dropdown Candidates */}
                      {isAssignOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 max-h-60 overflow-y-auto">
                          <p className="text-[10px] text-slate-400 font-bold px-2 py-1.5 uppercase border-b border-slate-50">Available Candidates</p>
                          {eligibleProviders.length === 0 ? (
                            <p className="text-xs text-slate-400 italic px-2 py-3 text-center">No available matching providers in pool.</p>
                          ) : (
                            eligibleProviders.map((p) => (
                              <button
                                key={p.providerId}
                                onClick={() => handleAssignProvider(p.providerId)}
                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-100 transition-all duration-200 mt-1"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-[10px]">
                                    {p.fullName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{p.fullName}</p>
                                    <p className="text-[9px] text-slate-400 truncate max-w-[140px]">{p.businessName || p.location}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                                  <Star size={10} fill="currentColor" />
                                  <span>{p.averageRating}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
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
                          <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                            {p.fullName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{p.fullName}</p>
                            <p className="text-xs text-slate-400">{p.businessName || "Contractor"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignProvider(p.providerId)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={15} />
                        </button>
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
      )}

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-800">New Pro Job Ticket</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workers Required</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={createForm.workersRequired}
                    onChange={(e) => setCreateForm({ ...createForm, workersRequired: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.scheduledDate}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                  />
                </div>
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
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu Marriott Hotel, Room 104"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-gray-900 font-medium"
                />
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
                  onClick={() => setIsCreateOpen(false)}
                  className="w-1/2 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: NAVY }}
                  className="w-1/2 text-white py-3 rounded-xl font-extrabold shadow-lg hover:opacity-90 transition-opacity"
                >
                  Publish Ticket
                </button>
              </div>
            </form>
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