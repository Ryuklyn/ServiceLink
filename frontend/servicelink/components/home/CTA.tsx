export default function CTA() {
  return (
    <section className="py-12 md:py-16 bg-white relative">
      <div className="max-w-full mx-auto px-4 lg:px-8">
        <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] rounded-[2.5rem] p-8 md:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl mix-blend-screen"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              Whether you need a service or want to become a provider,
              ServiceLink has you covered.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 text-white font-bold px-8 py-4 rounded-xl transition-colors">
                Create Free Account
              </button>
              <button className="bg-white hover:bg-gray-100 text-[#1e3a8a] shadow-lg font-bold px-8 py-4 rounded-xl transition-colors">
                Explore Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
