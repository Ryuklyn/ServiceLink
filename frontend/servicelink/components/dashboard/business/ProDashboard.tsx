import StatCards from "./StatCards";
import RecentJobTickets from "./RecentJobTickets";
import SLAPerformance from "./SLAPerformance";
import MonthlyBudget from "./MonthlyBudget";
import ProviderHealthSummary from "./ProviderHealthSummary";
import HotelHeader from "@/components/dashboard/business/HotelHeader";

export default function ProDashboard() {
    return (
        <div className="space-y-6">
            <HotelHeader />
            <StatCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentJobTickets />
                </div>
                <div>
                    <SLAPerformance />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyBudget />
                <ProviderHealthSummary />
            </div>
        </div>
    );
}