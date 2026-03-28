import { CATEGORIES } from "@/data/homeData";

export default function Categories() {
  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold tracking-widest text-[#1e3a8a] uppercase mb-3">
            Categories
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b]">
            Explore Services by Category
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            
            return (
              <a 
                key={idx} 
                href="#"
                className="flex items-center gap-4 p-4 rounded-xl md:rounded-full bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors ${cat.color}`}>
                  <Icon strokeWidth={1.5} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {cat.providers} providers
                  </p>
                </div>
              </a>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
