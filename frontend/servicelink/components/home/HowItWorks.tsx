import { HOW_IT_WORKS } from "@/data/homeData";
import { Search, Calendar, CreditCard, Star } from "lucide-react";

const iconMap: Record<string, any> = {
  Search,
  Calendar,
  CreditCard,
  Star,
};

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold tracking-widest text-orange-500 uppercase mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
            How It Works
          </h2>
          <p className="text-gray-500">
            Four simple steps to get your service done right.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-[2px] bg-gray-200 -z-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {HOW_IT_WORKS.map((step, idx) => {
              const IconComp = iconMap[step.icon];
              
              return (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  
                  {/* Icon Circle */}
                  <div className="w-20 h-20 rounded-full bg-[#1e293b] text-white flex items-center justify-center shadow-lg mb-6 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                    {IconComp && <IconComp className="w-8 h-8" />}
                  </div>

                  {/* Number Badge */}
                  <div className="text-sm font-bold text-orange-500 mb-3">
                    {step.num}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    {step.desc}
                  </p>
                  
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </section>
  );
}
