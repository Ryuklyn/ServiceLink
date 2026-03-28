import ServiceCard from "../ui/ServiceCard";
import { FEATURED_SERVICES } from "@/data/homeData";
import { ArrowRight } from "lucide-react";

export default function FeaturedServices() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-orange-500 uppercase mb-3">
              Top Rated
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b]">
              Featured Services
            </h2>
          </div>
          <button className="flex items-center gap-2 text-[#1e3a8a] font-medium hover:text-[#1e40af] transition-colors bg-blue-50 px-5 py-2.5 rounded-full outline outline-1 outline-blue-100">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_SERVICES.map((s, i) => (
            <ServiceCard key={i} service={s} />
          ))}
        </div>
        
      </div>
    </section>
  );
}
