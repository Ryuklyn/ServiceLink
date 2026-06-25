import Image from "next/image";

export default function Footer() {
  return (
      <footer className="bg-[#1e3a8a] text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Column 1: Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Image
                    src="/images/SLWHITE.png"
                    alt="ServiceLink Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                />
                <h1 className="font-bold text-xl text-white tracking-tight">ServiceLink</h1>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nepal's trusted service booking platform. Connect with verified professionals for all your home and business needs.
              </p>
              <div className="flex gap-4">
              <a
                href="https://www.facebook.com/ryuklyn.king/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#e8683f] transition"
                >
                <span className="sr-only">Facebook</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12.073c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.988C18.343 21.201 22 17.064 22 12.073z" />
                </svg>
              </a>
              <a
              href="https://x.com/Rukeshmaharja12"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#e8683f] transition"
              >
              <span className="sr-only">Twitter</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
            href="https://www.instagram.com/mohrjn/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#e8683f] transition"
            >
            <span className="sr-only">Instagram</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </a>
          <a
          href="https://www.linkedin.com/in/rukesh-maharjan"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#e8683f] transition"
          >
          <span className="sr-only">LinkedIn</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
          </svg>
        </a>
      </div>
</div>

  {/* Column 2: Quick Links */}
  <div>
    <h3 className="text-white font-semibold mb-6">Quick Links</h3>
    <ul className="space-y-4 text-sm text-gray-400">
      <li><a href="/(main)/services" className="hover:text-white transition">Browse Service</a></li>
      <li><a href="/(main)/becomeprovider" className="hover:text-white transition">Become a Provider</a></li>
      <li><a href="/frontend/servicelink/app/(main)/servicelinkpro" className="hover:text-white transition">ServiceLink Pro</a></li>
      <li><a href="/frontend/servicelink/app/(main)/aboutus" className="hover:text-white transition">About Us</a></li>
    </ul>
  </div>

  {/* Column 3: Popular Services */}
  <div>
    <h3 className="text-white font-semibold mb-6">Popular Services</h3>
    <ul className="space-y-4 text-sm text-gray-400">
      <li><a href="#" className="hover:text-white transition">Plumbing</a></li>
      <li><a href="#" className="hover:text-white transition">Electrical</a></li>
      <li><a href="#" className="hover:text-white transition">Deep Cleaning</a></li>
      <li><a href="#" className="hover:text-white transition">Painting</a></li>
      <li><a href="#" className="hover:text-white transition">Carpentry</a></li>
      <li><a href="#" className="hover:text-white transition">Pest Control</a></li>
    </ul>
  </div>

  {/* Column 4: Contact Us */}
  <div>
    <h3 className="text-white font-semibold mb-6">Contact Us</h3>
    <ul className="space-y-4 text-sm text-gray-400">
      <li className="flex items-start gap-3">
        <svg className="w-5 h-5 text-[#e8683f] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <span>Putalisadak, Kathmandu, Nepal</span>
      </li>
      <li className="flex items-center gap-3">
        <svg className="w-5 h-5 text-[#e8683f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        <span>+977-9863352116</span>
      </li>
      <li className="flex items-center gap-3">
        <svg className="w-5 h-5 text-[#e8683f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        <span>servicelink1607@gmail.com</span>
      </li>
    </ul>

    <h3 className="text-white font-semibold mb-4 mt-8">We Accept</h3>
    <div className="flex items-center gap-3">
      <Image
          src="/images/esewa.png"
          alt="eSewa"
          width={80}
          height={38}
          className="h-14 w-auto object-contain rounded bg-white"
      />
      <Image
          src="/images/khalti.png"
          alt="Khalti"
          width={70}
          height={28}
          className="h-14 w-auto object-contain rounded bg-white"
      />
    </div>
  </div>
</div>

  {/* Bottom Bar */}
  <div className="border-t border-white/15 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
    <p className="text-sm text-gray-500">© 2024 ServiceLink Nepal. All rights reserved.</p>
    <div className="flex gap-6 text-sm text-gray-500">
      <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
      <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
    </div>
  </div>
</div>
</footer>
);
}