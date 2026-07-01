"use client";

import {
  Zap,
  Droplet,
  Sparkles,
  Paintbrush2,
  Wind,
  Hammer,
  Wifi,
  Settings2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  iconBg: string;
  iconColor: string;
}

interface CategoriesSectionProps {
  categories?: Category[];
}

export default function CategoriesSection({
                                            categories,
                                          }: CategoriesSectionProps) {
  const defaultCategories: Category[] = [
    { id: "1", name: "Electrician", icon: <Zap className="w-5 h-5" />, count: 12, iconBg: "bg-blue-100", iconColor: "text-blue-500" },
    { id: "2", name: "Plumbing", icon: <Droplet className="w-5 h-5" />, count: 9, iconBg: "bg-teal-100", iconColor: "text-teal-500" },
    { id: "3", name: "Cleaning", icon: <Sparkles className="w-5 h-5" />, count: 15, iconBg: "bg-green-100", iconColor: "text-green-500" },
    { id: "4", name: "Painting", icon: <Paintbrush2 className="w-5 h-5" />, count: 7, iconBg: "bg-purple-100", iconColor: "text-purple-500" },
    { id: "5", name: "AC Repair", icon: <Wind className="w-5 h-5" />, count: 11, iconBg: "bg-sky-100", iconColor: "text-sky-500" },
    { id: "6", name: "Carpentry", icon: <Hammer className="w-5 h-5" />, count: 6, iconBg: "bg-orange-100", iconColor: "text-orange-500" },
    { id: "7", name: "Internet Repair", icon: <Wifi className="w-5 h-5" />, count: 8, iconBg: "bg-indigo-100", iconColor: "text-indigo-500" },
    { id: "8", name: "Appliance Repair", icon: <Settings2 className="w-5 h-5" />, count: 10, iconBg: "bg-red-100", iconColor: "text-red-400" },
  ];

  const displayCategories = categories || defaultCategories;

  return (
      <section className="mb-8 sm:mb-12">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
          Browse Categories
        </h2>

        {/* 2 col mobile, 3 col tablet, 4 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayCategories.map((category) => (
              <button
                  key={category.id}
                  className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 text-left hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <div
                    className={`${category.iconBg} ${category.iconColor} w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200`}
                >
                  {category.icon}
                </div>

                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                  {category.name}
                </h3>

                <p className="text-xs text-gray-500">{category.count} providers</p>
              </button>
          ))}
        </div>
      </section>
  );
}