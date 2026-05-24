"use client";

import {
  Zap,
  Droplet,
  Leaf,
  Paintbrush,
  Wind,
  Hammer,
  Wifi,
  Settings,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface CategoriesSectionProps {
  categories?: Category[];
}

export default function CategoriesSection({
  categories,
}: CategoriesSectionProps) {
  const defaultCategories: Category[] = [
    {
      id: "1",
      name: "Electrician",
      icon: <Zap className="w-6 h-6" />,
      count: 12,
      color: "bg-blue-700",
    },
    {
      id: "2",
      name: "Plumbing",
      icon: <Droplet className="w-6 h-6" />,
      count: 9,
      color: "bg-teal-500",
    },
    {
      id: "3",
      name: "Cleaning",
      icon: <Leaf className="w-6 h-6" />,
      count: 15,
      color: "bg-green-500",
    },
    {
      id: "4",
      name: "Painting",
      icon: <Paintbrush className="w-6 h-6" />,
      count: 7,
      color: "bg-purple-600",
    },
    {
      id: "5",
      name: "AC Repair",
      icon: <Wind className="w-6 h-6" />,
      count: 11,
      color: "bg-cyan-500",
    },
    {
      id: "6",
      name: "Carpentry",
      icon: <Hammer className="w-6 h-6" />,
      count: 6,
      color: "bg-amber-700",
    },
    {
      id: "7",
      name: "Internet Repair",
      icon: <Wifi className="w-6 h-6" />,
      count: 5,
      color: "bg-blue-900",
    },
    {
      id: "8",
      name: "Appliance Repair",
      icon: <Settings className="w-6 h-6" />,
      count: 10,
      color: "bg-orange-600",
    },
  ];

  const displayCategories = categories || defaultCategories;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Browse Categories
      </h2>
      <div className="grid grid-cols-4 gap-6">
        {displayCategories.map((category) => (
          <button
            key={category.id}
            className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-center cursor-pointer"
          >
            <div
              className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold group-hover:scale-110 transition-transform`}
            >
              {category.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600">{category.count} providers</p>
          </button>
        ))}
      </div>
    </section>
  );
}
