import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ServPro() {
    const features = [
        "One dashboard to manage all your service needs",
        "Verified providers you can trust",
        "Managed at scale with priority support",
    ];

    return (
        <section className="bg-white py-20">
            <div className="max-w-full mx-auto px-4 lg:px-8">
                {/* Section Heading */}
                <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            ServiceLink Pro
          </span>
                    <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-[#1e3a8a]">
                        Business Enterprise Solution
                    </h2>
                </div>

                {/* Dark Blue Card */}
                <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-3xl px-8 sm:px-12 pt-12 pb-8 relative overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text content */}
                        <div>
              <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
                For Businesses
              </span>

                            <h3 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                ServiceLink <span className="text-[#e8683f]">Pro</span> —
                                <br />
                                Built for Businesses
                            </h3>

                            <p className="mt-5 text-white/80 text-base leading-relaxed max-w-md">
                                Hotels, hospitals, and organizations that need reliable
                                service providers regularly and in bulk.
                            </p>

                            <ul className="mt-6 space-y-3">
                                {features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#e8683f] flex-shrink-0 mt-0.5" />
                                        <span className="text-white/90 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="mt-8 bg-[#e8683f] hover:bg-gray-50 text-white font-semibold flex items-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group">
                                Get Enterprise Access
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Right: Product mockup image */}
                        <div className="relative flex justify-center lg:justify-end">
                            <img
                                src="/images/proimage.png"
                                alt="ServiceLink Pro dashboard on laptop and mobile"
                                className="w-full max-w-xl object-contain"
                            />
                        </div>
                    </div>

                    {/* Trusted by line */}
                    <p className="text-center text-white/70 text-sm mt-10 pt-6 border-t border-white/10">
                        Trusted by hotels, hospitals, schools &amp; 100+ businesses across
                        Nepal
                    </p>
                </div>
            </div>
        </section>
    );
}