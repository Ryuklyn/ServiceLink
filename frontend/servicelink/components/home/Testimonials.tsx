import { TESTIMONIALS } from "@/data/homeData";
import StarRating from "../ui/StarRating";

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold tracking-widest text-orange-500 uppercase mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b]">
            What Our Users Say
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow"
            >
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={t.rating} />
                <span className="text-sm font-bold text-gray-700">{t.rating}.0</span>
              </div>
              
              {/* Quote */}
              <p className="text-gray-600 italic text-sm flex-grow mb-6 leading-relaxed">
                "{t.quote}"
              </p>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {t.initial}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
