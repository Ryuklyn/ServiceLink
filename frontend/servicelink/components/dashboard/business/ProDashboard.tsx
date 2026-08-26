"use client";

import { useEffect, useState } from "react";
import StatCards from "./StatCards";
import RecentJobTickets from "./RecentJobTickets";
import SLAPerformance from "./SLAPerformance";
import MonthlyBudget from "./MonthlyBudget";
import ProviderHealthSummary from "./ProviderHealthSummary";
import HotelHeader from "@/components/dashboard/business/HotelHeader";
import { proJobService, ProKpiDashboardResponse, ProJobTicketResponse } from "@/services/proJobService";

export default function ProDashboard() {
  const [kpi, setKpi] = useState<ProKpiDashboardResponse | null>(null);
  const [jobs, setJobs] = useState<ProJobTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [kpiData, jobsData] = await Promise.all([
          proJobService.getKpiDashboard(),
          proJobService.getJobs(undefined, 0, 5),
        ]);
        setKpi(kpiData);
        setJobs(jobsData.content || []);
      } catch (err) {
        console.error("Failed to load business dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <HotelHeader />
      <StatCards kpi={kpi} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentJobTickets jobs={jobs} loading={loading} />
        </div>
        <div>
          <SLAPerformance kpi={kpi} loading={loading} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyBudget kpi={kpi} loading={loading} />
        <ProviderHealthSummary kpi={kpi} loading={loading} />
      </div>
    </div>
  );
}