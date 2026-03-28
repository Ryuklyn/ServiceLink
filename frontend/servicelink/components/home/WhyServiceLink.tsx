import { WHY_FEATURES } from "@/data/homeData";
import { BadgeCheck, Wallet, MapPin, Star, Users, Grid } from "lucide-react";

const iconMap: Record<string, any> = {
  BadgeCheck,
  Wallet,
  MapPin,
  Star,
  Users,
  Grid,
};

export default function WhyServiceLink() {
  return (
    <section className="py-24 bg-[#1e3a8a] text-white overflow-hidden relative">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-500 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-blue-400 blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase mb-3 drop-shadow-sm">
            Why ServiceLink
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Built for Nepal, Built on Trust
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_FEATURES.map((feature, idx) => {
            const Icon = iconMap[feature.icon];
            return (
              <div 
                key={idx} 
                className="bg-[#1e40af]/40 backdrop-blur-md border border-blue-400/30 p-8 rounded-2xl hover:bg-[#1e40af]/60 hover:border-blue-400/60 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-blue-200/80 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
