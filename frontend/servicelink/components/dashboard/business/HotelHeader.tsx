import React from 'react';
import { Building2, MapPin, Users, Calendar } from 'lucide-react';

export default function HotelHeader() {
    return (
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 rounded-xl border border-gray-100 bg-slate-50/70 p-4 text-sm font-medium text-slate-600 shadow-sm">
            {/* Hotel Name - Using Brand Deep Blue #1e3a8a */}
            <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Building2 className="h-5 w-5 text-[#1e3a8a]" />
                <span className="text-slate-900">Hotel Annapurna</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Thamel, Kathmandu</span>
            </div>

            {/* Badge - Using Brand Orange #e8683f */}
            <span className="inline-flex items-center rounded-md bg-[#e8683f]/10 px-2.5 py-0.5 text-xs font-bold tracking-wide text-[#e8683f] border border-[#e8683f]/20 uppercase">
                Growth Plan
            </span>

            {/* Team Members */}
            <div className="flex items-center gap-1.5 text-slate-500">
                <Users className="h-4 w-4 text-slate-400" />
                <span>5 team members</span>
            </div>

            {/* History */}
            <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Pro since Nov 2024</span>
            </div>
        </div>
    );
}