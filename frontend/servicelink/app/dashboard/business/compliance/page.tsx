"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  XCircle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { proJobService, ProJobDetailResponse } from "@/services/proJobService";
import { toast } from "react-toastify";

const NAVY = "#1e3a8a";

interface SlaStatusResult {
  overallSla: "COMPLIANT" | "AT_RISK" | "BREACHED";
  workforceState: "COMPLIANT" | "AT_RISK" | "BREACHED";
  attendanceState: "COMPLIANT" | "AT_RISK" | "BREACHED" | "PENDING";
  locationState: "COMPLIANT" | "BREACHED" | "PENDING";
  timelinessState: "COMPLIANT" | "AT_RISK" | "BREACHED" | "PENDING";
  completionState: "COMPLIANT" | "BREACHED" | "PENDING";
  reasons: string[];
  checkedInCount: number;
  acceptedCount: number;
}

export default function SLACompliancePage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  
  // High-fidelity: Load full details for all active/completed jobs on mount to populate the matrix accurately
  const [detailedJobs, setDetailedJobs] = useState<ProJobDetailResponse[]>([]);

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

  const fetchAndCalculateSlaData = async () => {
    setLoading(true);
    try {
      const res = await proJobService.getJobs(undefined, 0, 100);
      const activeOrCompleted = res.content.filter(
        j => j.status !== "CANCELLED" && j.status !== "UNFULFILLED"
      );

      // Fetch full details for all tracked jobs to read live geofence location and timeliness check-ins
      const detailsList = await Promise.all(
        activeOrCompleted.map(async (job) => {
          try {
            return await proJobService.getJobDetails(job.id);
          } catch {
            return null;
          }
        })
      );
      setDetailedJobs(detailsList.filter(Boolean) as ProJobDetailResponse[]);
    } catch (err) {
      console.error("Failed to load SLA logs:", err);
      toast.error("Failed to sync SLA compliance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCalculateSlaData();
  }, []);

  // SLA Resolver Engine
  const resolveJobSla = (job: ProJobDetailResponse): SlaStatusResult => {
    const activeAssignments = job.assignments?.filter(a => a.status === "ACCEPTED") || [];
    const acceptedCount = activeAssignments.length;
    const now = new Date();
    
    const startDate = new Date(job.startDate + "T" + job.startTime);
    const endDate = new Date(job.endDate + "T" + job.endTime);
    const isPastStart = now > startDate;
    const isPastEnd = now > endDate;

    // Grace period time limit (15 mins past start)
    const graceTimeLimit = new Date(startDate.getTime() + 15 * 60 * 1000);
    const isPastGrace = now > graceTimeLimit;

    // 1. Workforce check (category-wise)
    const parsed = parseInstructionsAndWorkforce(job.instructions);
    let workforceState: "COMPLIANT" | "AT_RISK" | "BREACHED" = "COMPLIANT";
    let workforceDetails = "";
    
    if (parsed.requirements.length > 0) {
      const categoriesStatus = parsed.requirements.map(req => {
        const acceptedForSkill = activeAssignments.filter(
          a => a.requiredSkill?.toLowerCase() === req.skill.toLowerCase()
        ).length;
        return {
          skill: req.skill,
          accepted: acceptedForSkill,
          required: req.workersRequired
        };
      });
      
      const understaffed = categoriesStatus.filter(c => c.accepted < c.required);
      if (understaffed.length > 0) {
        workforceState = isPastStart ? "BREACHED" : "AT_RISK";
        workforceDetails = understaffed.map(c => `${c.skill}: ${c.accepted}/${c.required}`).join(", ");
      } else {
        workforceState = "COMPLIANT";
      }
    } else {
      if (acceptedCount < job.workersRequired) {
        workforceState = isPastStart ? "BREACHED" : "AT_RISK";
      }
    }

    // 2. Attendance & Timeliness & Location
    let attendanceState: "COMPLIANT" | "AT_RISK" | "BREACHED" | "PENDING" = "PENDING";
    let locationState: "COMPLIANT" | "BREACHED" | "PENDING" = "PENDING";
    let timelinessState: "COMPLIANT" | "AT_RISK" | "BREACHED" | "PENDING" = "PENDING";
    
    const checkedInCount = job.attendance.filter(a => a.checkInTime !== null).length;
    
    if (acceptedCount > 0) {
      if (checkedInCount === 0) {
        if (isPastGrace) {
          attendanceState = "BREACHED";
          timelinessState = "BREACHED";
        } else if (isPastStart) {
          attendanceState = "AT_RISK";
          timelinessState = "AT_RISK";
        } else {
          attendanceState = "PENDING";
          timelinessState = "PENDING";
        }
      } else {
        const lates = job.attendance.filter(a => a.status === "LATE");
        const absents = job.attendance.filter(a => a.status === "ABSENT" || a.status === "MISSING");
        const unverified = job.attendance.filter(a => a.locationVerified === false);

        if (checkedInCount < acceptedCount && isPastGrace) {
          attendanceState = "BREACHED"; // Worker failed to attend
        } else {
          attendanceState = "COMPLIANT";
        }

        if (unverified.length > 0) {
          locationState = "BREACHED";
        } else {
          locationState = "COMPLIANT";
        }

        if (absents.length > 0 && isPastGrace) {
          timelinessState = "BREACHED";
        } else if (lates.length > 0) {
          timelinessState = "AT_RISK"; // Late check-in is AT_RISK
        } else {
          timelinessState = "COMPLIANT";
        }
      }
    }

    // 3. Completion check
    let completionState: "COMPLIANT" | "BREACHED" | "PENDING" = "PENDING";
    if (job.status === "COMPLETED") {
      completionState = "COMPLIANT";
    } else if (isPastEnd) {
      completionState = "BREACHED";
    }

    // Aggregate overall status
    let overallSla: "COMPLIANT" | "AT_RISK" | "BREACHED" = "COMPLIANT";
    const reasons: string[] = [];

    if (
      workforceState === "BREACHED" ||
      attendanceState === "BREACHED" ||
      locationState === "BREACHED" ||
      timelinessState === "BREACHED" ||
      completionState === "BREACHED"
    ) {
      overallSla = "BREACHED";
      if (workforceState === "BREACHED") reasons.push("Workforce commitment missed: understaffed past start date.");
      if (attendanceState === "BREACHED") reasons.push("Attendance missed: one or more assigned providers failed to check in.");
      if (locationState === "BREACHED") reasons.push("Location violation: geofence validation coordinates verification failed.");
      if (timelinessState === "BREACHED") reasons.push("Attendance breach: check-in grace period window exceeded.");
      if (completionState === "BREACHED") reasons.push("Completion timeline breached: scheduled end date/time exceeded.");
    } else if (
      workforceState === "AT_RISK" ||
      attendanceState === "AT_RISK" ||
      timelinessState === "AT_RISK"
    ) {
      overallSla = "AT_RISK";
      if (workforceState === "AT_RISK") reasons.push(`Workforce incomplete: awaiting responses (${workforceDetails || "understaffed"}).`);
      if (attendanceState === "AT_RISK") reasons.push("Attendance pending: scheduled start time reached, waiting for check-ins.");
      if (timelinessState === "AT_RISK") reasons.push("Late arrival: a provider arrived late.");
    } else {
      overallSla = "COMPLIANT";
      reasons.push("All SLA parameters currently compliant.");
    }

    return {
      overallSla,
      workforceState,
      attendanceState,
      locationState,
      timelinessState,
      completionState,
      reasons,
      checkedInCount,
      acceptedCount
    };
  };

  // Filter lists based on search
  const filteredJobs = detailedJobs.filter(
    j =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute status metrics dynamically
  const activeJobsCount = detailedJobs.filter(j => j.status !== "COMPLETED").length;
  const completedJobsCount = detailedJobs.filter(j => j.status === "COMPLETED").length;

  const compliantCount = detailedJobs.filter(j => j.status !== "COMPLETED" && resolveJobSla(j).overallSla === "COMPLIANT").length;
  const atRiskCount = detailedJobs.filter(j => j.status !== "COMPLETED" && resolveJobSla(j).overallSla === "AT_RISK").length;
  const breachedCount = detailedJobs.filter(j => j.status !== "COMPLETED" && resolveJobSla(j).overallSla === "BREACHED").length;

  return (
    <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SLA Compliance Console</h1>
          <p className="text-sm text-slate-500 mt-0.5">Are our active ServiceLink Pro jobs being fulfilled according to what we promised?</p>
        </div>
        <button
          onClick={fetchAndCalculateSlaData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors self-end sm:self-auto"
        >
          <RefreshCw size={15} />
          Sync Audit
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
          <p className="text-gray-400 text-sm font-medium">Reconciling geofenced check-ins and workforce timelines...</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Jobs</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{activeJobsCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs border-l-4 border-l-emerald-500">
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Compliant</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{compliantCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs border-l-4 border-l-amber-500">
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">At Risk</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{atRiskCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs border-l-4 border-l-red-500">
              <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Breached</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{breachedCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs border-l-4 border-l-[#1e3a8a]">
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{completedJobsCount}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search active jobs by reference ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-slate-800 font-semibold"
            />
          </div>

          {/* SLA Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">SLA Fulfillment Matrix</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">No tracked jobs match current filters.</div>
              ) : (
                filteredJobs.map((job) => {
                  const sla = resolveJobSla(job);
                  const isExpanded = expandedJobId === job.id;

                  return (
                    <div key={job.id} className="transition-colors hover:bg-slate-50/30">
                      {/* Accordion Header Row */}
                      <div
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-[#1e3a8a] bg-[#1e3a8a]/5 px-2 py-0.5 rounded">
                              {job.reference}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                              job.status === "COMPLETED" ? "bg-slate-100 text-slate-500" :
                              sla.overallSla === "COMPLIANT" ? "bg-emerald-50 text-emerald-600" :
                              sla.overallSla === "AT_RISK" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                            }`}>
                              {job.status === "COMPLETED" ? "Completed" : sla.overallSla}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-sm mt-1.5 truncate">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-semibold">
                            <Calendar size={11} />
                            <span>{job.startDate} to {job.endDate} ({job.startTime.substring(0, 5)} - {job.endTime.substring(0, 5)})</span>
                          </div>
                        </div>

                        {/* Checklist values */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 text-[11px] font-bold text-slate-600">
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Workforce</span>
                            <span className={sla.workforceState === "COMPLIANT" ? "text-emerald-600" : sla.workforceState === "AT_RISK" ? "text-amber-600" : "text-red-500"}>
                              {sla.acceptedCount}/{job.workersRequired} {sla.workforceState === "COMPLIANT" ? "✓" : "⚠"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Attendance</span>
                            <span className={sla.attendanceState === "COMPLIANT" ? "text-emerald-600" : sla.attendanceState === "AT_RISK" ? "text-amber-600" : sla.attendanceState === "BREACHED" ? "text-red-500" : "text-slate-400"}>
                              {sla.checkedInCount}/{sla.acceptedCount} checked-in
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Location</span>
                            <span className={sla.locationState === "COMPLIANT" ? "text-emerald-600" : sla.locationState === "BREACHED" ? "text-red-500" : "text-slate-400"}>
                              {sla.locationState === "COMPLIANT" ? "✓ Correct" : sla.locationState === "BREACHED" ? "X Alert" : "Pending"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Timeliness</span>
                            <span className={sla.timelinessState === "COMPLIANT" ? "text-emerald-600" : sla.timelinessState === "AT_RISK" ? "text-amber-600" : sla.timelinessState === "BREACHED" ? "text-red-500" : "text-slate-400"}>
                              {sla.timelinessState === "COMPLIANT" ? "✓ On Time" : sla.timelinessState === "AT_RISK" ? "⚠ Late" : sla.timelinessState === "BREACHED" ? "X Absent" : "Pending"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Completion</span>
                            <span className={sla.completionState === "COMPLIANT" ? "text-emerald-600" : sla.completionState === "BREACHED" ? "text-red-500" : "text-slate-500"}>
                              {job.status === "COMPLETED" ? "Completed" : "Pending"}
                            </span>
                          </div>
                        </div>

                        {/* Chevron */}
                        <div className="text-slate-400 shrink-0 pl-2">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* Expandable Panel */}
                      {isExpanded && (
                        <div className="bg-slate-50/70 border-t border-slate-100 p-6 space-y-4">
                          {/* SLA evaluation warning banner */}
                          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            sla.overallSla === "COMPLIANT" ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" :
                            sla.overallSla === "AT_RISK" ? "bg-amber-50/50 border-amber-100 text-amber-800" :
                            "bg-rose-50/50 border-rose-100 text-rose-800"
                          }`}>
                            {sla.overallSla === "COMPLIANT" && <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />}
                            {sla.overallSla === "AT_RISK" && <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />}
                            {sla.overallSla === "BREACHED" && <XCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />}

                            <div className="space-y-1">
                              <p className="text-xs font-black uppercase tracking-wider">
                                SLA STATUS DETAILS: {job.status === "COMPLETED" ? "JOB COMPLETED" : sla.overallSla}
                              </p>
                              <div className="text-xs font-semibold leading-relaxed">
                                {sla.reasons.map((r, i) => (
                                  <div key={i} className="flex items-center gap-1.5 mt-0.5">
                                    <span>•</span>
                                    <span>{r}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Dimensions grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Workforce Staffing */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workforce compliance</p>
                              <p className="text-xs font-black text-slate-700 mt-1">
                                {sla.acceptedCount} of {job.workersRequired} workers confirmed
                              </p>
                              <span className={`inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                sla.workforceState === "COMPLIANT" ? "bg-emerald-50 text-emerald-600" :
                                sla.workforceState === "AT_RISK" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                              }`}>
                                {sla.workforceState === "COMPLIANT" ? "✓ COMPLIANT" : sla.workforceState === "AT_RISK" ? "⚠ AT RISK" : "✗ BREACHED"}
                              </span>
                            </div>

                            {/* Attendance Timeliness */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in timeliness</p>
                              <p className="text-xs font-black text-slate-700 mt-1">
                                {job.attendance.filter(a => a.status === "PRESENT").length} of {sla.acceptedCount} on time
                              </p>
                              <span className={`inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                sla.timelinessState === "COMPLIANT" ? "bg-emerald-50 text-emerald-600" :
                                sla.timelinessState === "AT_RISK" ? "bg-amber-50 text-amber-600" :
                                sla.timelinessState === "BREACHED" ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
                              }`}>
                                {sla.timelinessState === "COMPLIANT" ? "✓ COMPLIANT" : sla.timelinessState === "AT_RISK" ? "⚠ LATE" : sla.timelinessState === "BREACHED" ? "✗ BREACHED" : "PENDING"}
                              </span>
                            </div>

                            {/* Location Compliance */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location Compliance</p>
                              <p className="text-xs font-black text-slate-700 mt-1">
                                {job.attendance.filter(a => a.locationVerified).length} verified check-ins
                              </p>
                              <span className={`inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                sla.locationState === "COMPLIANT" ? "bg-emerald-50 text-emerald-600" :
                                sla.locationState === "BREACHED" ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
                              }`}>
                                {sla.locationState === "COMPLIANT" ? "✓ VERIFIED" : sla.locationState === "BREACHED" ? "✗ MISMATCH" : "PENDING"}
                              </span>
                            </div>

                            {/* Completion Compliance */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Window</p>
                              <p className="text-xs font-black text-slate-700 mt-1">
                                {job.status === "COMPLETED" ? "Job completed on schedule" : "Fulfillment pending"}
                              </p>
                              <span className={`inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                sla.completionState === "COMPLIANT" ? "bg-emerald-50 text-emerald-600" :
                                sla.completionState === "BREACHED" ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
                              }`}>
                                {sla.completionState === "COMPLIANT" ? "✓ COMPLIANT" : sla.completionState === "BREACHED" ? "✗ OVERDUE" : "RUNNING"}
                              </span>
                            </div>
                          </div>

                          {/* Detail audits */}
                          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mt-4">
                            <div className="p-3.5 bg-slate-50/60 border-b border-slate-100">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Provider SLA Audit Checklist</h4>
                            </div>
                            <div className="divide-y divide-slate-100">
                              {job.assignments.length === 0 ? (
                                <p className="p-4 text-xs text-slate-400 italic">No assigned providers for this ticket.</p>
                              ) : (
                                job.assignments.map((prov) => {
                                  const attendance = job.attendance.find(a => a.providerId === prov.providerId);

                                  return (
                                    <div key={prov.providerId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                      <div>
                                        <p className="font-extrabold text-slate-800">{prov.fullName}</p>
                                        <p className="text-[10px] text-[#1e3a8a] font-semibold mt-0.5">{prov.requiredSkill}</p>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-4 text-slate-600 font-semibold">
                                        <div>
                                          <span className="block text-[9px] text-slate-400 uppercase">Check-in Time</span>
                                          <span>
                                            {attendance?.checkInTime 
                                              ? new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                              : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="block text-[9px] text-slate-400 uppercase">Timeliness</span>
                                          <span className={attendance?.status === "LATE" ? "text-amber-600 font-bold" : attendance?.status === "PRESENT" ? "text-emerald-600" : "text-slate-400"}>
                                            {attendance?.status === "LATE" ? "Late (Grace Exceeded)" : attendance?.status === "PRESENT" ? "On Time" : "No Check-in (Absent)"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="block text-[9px] text-slate-400 uppercase">Location Status</span>
                                          <span className={attendance?.locationVerified ? "text-emerald-600" : attendance ? "text-red-500 font-bold" : "text-slate-400"}>
                                            {attendance?.locationVerified ? "✓ Verified Geofence" : attendance ? "✗ Outside Geofence" : "—"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}