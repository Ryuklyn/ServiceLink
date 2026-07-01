"use client";

export default function BookingAlert({
                                         status = "Provider is on the way",
                                         providerName = "Ram Electrical Services",
                                         service = "Fan Installation",
                                         eta = "~15 min",
                                     }: {
    status?: string;
    providerName?: string;
    service?: string;
    eta?: string;
}) {
    return (
        <div className="bg-gradient-to-r from-[#ff9500] to-[#ff7b00] rounded-xl px-4 sm:px-6 py-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Top row on mobile: dot + status */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shrink-0" />
                <span className="text-white font-bold text-sm">{status}</span>
            </div>

            {/* Divider — desktop only */}
            <span className="text-white/40 text-lg shrink-0 hidden sm:inline">|</span>

            {/* Provider info */}
            <span className="text-white/90 text-xs sm:text-sm flex-1 truncate">
        {providerName} · {service} · ETA {eta}
      </span>

            {/* Buttons — full width stacked on mobile */}
            <div className="flex gap-2 shrink-0">
                <button className="flex-1 sm:flex-none bg-[#1e3a8a] text-white px-4 sm:px-5 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#152a6b] transition-colors">
                    Track Booking
                </button>
                <button className="flex-1 sm:flex-none bg-[#25D366] text-white px-4 sm:px-5 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#1ebe5a] transition-colors flex items-center justify-center gap-1.5">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12.001 2c-5.514 0-9.988 4.474-9.988 9.988 0 1.762.464 3.484 1.346 5.001L2 22l5.144-1.35a9.96 9.96 0 004.857 1.237h.004c5.514 0 9.988-4.474 9.988-9.988C21.993 6.474 17.519 2 12.001 2zm5.888 15.876a8.284 8.284 0 01-5.888 2.44h-.003a8.297 8.297 0 01-4.229-1.158l-.303-.18-3.053.801.815-2.978-.198-.306a8.27 8.27 0 01-1.269-4.409c0-4.577 3.727-8.303 8.307-8.303a8.257 8.257 0 015.874 2.435 8.258 8.258 0 012.435 5.87c0 4.578-3.727 8.304-8.303 8.304l.006-.006v-.01z" />
                    </svg>
                    <span className="hidden xs:inline">WhatsApp</span>
                </button>
            </div>
        </div>
    );
}