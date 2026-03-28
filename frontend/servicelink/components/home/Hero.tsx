import { HERO_STATS, FEATURED_SERVICES } from "@/data/homeData";
import { MoveRight } from "lucide-react";

export default function Hero() {
  // Take 4 featured services for the hero right-side widget
  const previewServices = FEATURED_SERVICES.slice(0, 4);

  return (
    <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white pt-24 pb-28 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -mr-48 -mt-48 -ml-10 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center relative z-10 lg:pl-10">
        {/* Left Column: Text & CTA */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/80">
              Trusted by 10,000+ users in Nepal
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Your Home, <br />
            <span className="whitespace-nowrap">
              <span className="text-accent">Perfectly</span> Serviced.
            </span>
          </h1>

          <p className="text-lg text-blue-100 max-w-lg leading-relaxed">
            Book verified professionals for plumbing, electrical, cleaning, and
            50+ services across Nepal. Secure payments with escrow protection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 ">
            <button className="bg-accent-400 hover:bg-accent-500 text-white font-semibold flex items-center justify-center px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all group">
              Book a Service
              <MoveRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold flex items-center justify-center px-8 py-3.5 rounded-xl shadow-lg transition-all">
              Become a Provider
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/20">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-blue-200 uppercase tracking-wider mt-1 lg:mt-0 lg:whitespace-nowrap">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Floating Cards Widget */}
        <div className="hidden md:block relative w-full lg:w-[100%] ml-20">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 sm:p-6 rounded-[2rem] shadow-2xl max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {previewServices.map((service, idx) => (
                <div
                  key={idx}
                  className="flex flex-col bg-white/20 backdrop-blur-md rounded-[1.5rem] overflow-hidden group hover:-translate-y-2 transition-transform duration-300 shadow-lg border border-white/5"
                >
                  <div className="h-32 sm:h-40 relative overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col justify-center">
                    <h4 className="font-bold text-sm sm:text-base text-white mb-1">
                      {service.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-100">
                      NPR {service.price}/hr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
