"use client";

import { useEffect, useState } from "react";
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
import { useTranslation } from "@/hooks/useTranslation";
import { getCategories, CategoryDTO } from "@/lib/api/providersApi";
import { useRouter } from "next/navigation";

function getCategoryTheme(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes("elect")) return { icon: <Zap className="w-5 h-5" />, bg: "bg-blue-100", color: "text-blue-500" };
  if (norm.includes("plumb")) return { icon: <Droplet className="w-5 h-5" />, bg: "bg-teal-100", color: "text-teal-500" };
  if (norm.includes("clean")) return { icon: <Sparkles className="w-5 h-5" />, bg: "bg-green-100", color: "text-green-500" };
  if (norm.includes("paint")) return { icon: <Paintbrush2 className="w-5 h-5" />, bg: "bg-purple-100", color: "text-purple-500" };
  if (norm.includes("hvac") || norm.includes("ac")) return { icon: <Wind className="w-5 h-5" />, bg: "bg-sky-100", color: "text-sky-500" };
  if (norm.includes("carp")) return { icon: <Hammer className="w-5 h-5" />, bg: "bg-orange-100", color: "text-orange-500" };
  if (norm.includes("net") || norm.includes("wifi")) return { icon: <Wifi className="w-5 h-5" />, bg: "bg-indigo-100", color: "text-indigo-500" };
  return { icon: <Settings2 className="w-5 h-5" />, bg: "bg-red-100", color: "text-red-400" };
}

export default function CategoriesSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.filter(c => c.isActive)))
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-8 text-center text-sm text-slate-400">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
      <section className="mb-8 sm:mb-12">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-5">
          {t("dashboard.categories")}
        </h2>

        {/* 2 col mobile, 3 col tablet, 4 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category) => {
            const theme = getCategoryTheme(category.name);
            return (
              <button
                  key={category.id}
                  onClick={() => router.push(`/dashboard/user/explore?category=${encodeURIComponent(category.name)}`)}
                  className="group bg-surface border border-border rounded-2xl p-4 sm:p-5 text-left hover:shadow-md hover:border-border-subtle transition-all duration-200 cursor-pointer"
              >
                <div
                    className={`${theme.bg} ${theme.color} w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-200`}
                >
                  {theme.icon}
                </div>

                <h3 className="font-bold text-text-primary text-sm leading-tight mb-1">
                  {category.name}
                </h3>

                <p className="text-xs text-text-secondary">{category.subServiceCount} {t("dashboard.services", "services")}</p>
              </button>
            );
          })}
        </div>
      </section>
  );
}