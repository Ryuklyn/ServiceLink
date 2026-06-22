"use client";

import { Search, Bell, ChevronDown } from "lucide-react";

export default function ProNavbar() {
    return (
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700">
                    <Search size={20} />
                </button>
                <button className="relative text-gray-500 hover:text-gray-700">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        RS
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800 leading-none">Rajesh Shrestha</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </div>
        </header>
    );
}