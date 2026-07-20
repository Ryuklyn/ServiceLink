    // "use client";
    //
    // import { useEffect } from "react";
    // import { useDispatch, useSelector } from "react-redux";
    // import { Wrench, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
    // import type { RootState, AppDispatch } from "@/store";
    // import {
    //     fetchCatalog,
    //     toggleService,
    //     updateServicePrice,
    //     saveOnboardingServices,
    // } from "@/store/slices/providerOnboardingSlice";
    // import type { CatalogItem } from "@/lib/api/onboardingApi";
    //
    // interface SubServicesStepProps {
    //     category: string;
    //     onNext: () => void;
    //     onBack: () => void;
    // }
    //
    // export default function SubServicesStep({ category, onNext, onBack }: SubServicesStepProps) {
    //     const dispatch = useDispatch<AppDispatch>();
    //     const { catalog, selections, loadingCatalog, savingServices, error } = useSelector(
    //         (s: RootState) => s.providerOnboarding,
    //     );
    //
    //     // Guarded so navigating Services → Referral → Back → Services doesn't
    //     // refetch the catalog every time — it only fetches once per session.
    //     useEffect(() => {
    //         if (catalog.length === 0) dispatch(fetchCatalog(category));
    //     }, [category, catalog.length, dispatch]);
    //
    //     const activeSelections = Object.values(selections).filter((s) => s.isAvailable);
    //     const hasInvalidPrice = activeSelections.some((s) => !s.customPrice || s.customPrice <= 0);
    //     const canProceed = catalog.length === 0 || (activeSelections.length > 0 && !hasInvalidPrice);
    //
    //     const handleNext = async () => {
    //         if (!canProceed) return;
    //
    //         // Nothing to save if there's no catalog for this category yet
    //         if (catalog.length === 0) {
    //             onNext();
    //             return;
    //         }
    //
    //         const result = await dispatch(saveOnboardingServices());
    //         if (saveOnboardingServices.fulfilled.match(result)) {
    //             onNext();
    //         }
    //     };
    //
    //     return (
    //         <div className="px-8 py-8">
    //             <div className="flex items-center gap-3 mb-1">
    //                 <div className="w-10 h-10 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center">
    //                     <Wrench size={18} className="text-[#1e3a8a]" aria-hidden />
    //                 </div>
    //                 <div>
    //                     <h2 className="text-lg font-bold text-[#1e3a8a]">Set Up Your Services</h2>
    //                     <p className="text-gray-400 text-xs">
    //                         Turn on what you offer and set your price. Customers will only see
    //                         services you've activated.
    //                     </p>
    //                 </div>
    //             </div>
    //
    //             <div className="mt-5 max-h-[340px] overflow-y-auto pr-1 space-y-2">
    //                 {loadingCatalog ? (
    //                     <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
    //                         <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
    //                         Loading services…
    //                     </div>
    //                 ) : catalog.length === 0 ? (
    //                     <p className="text-gray-400 text-sm text-center py-10">
    //                         No catalog items found for your category yet.
    //                     </p>
    //                 ) : (
    //                     catalog.map((item: CatalogItem) => {
    //                         const sel = selections[item.id];
    //                         const isOn = !!sel?.isAvailable;
    //                         return (
    //                             <div
    //                                 key={item.id}
    //                                 className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 transition-colors
    //                                     ${isOn ? "border-[#e8683f] bg-[#e8683f]/5" : "border-[#1e3a8a]/10"}`}
    //                             >
    //                                 <div className="flex items-center gap-3 min-w-0">
    //                                     <button
    //                                         role="switch"
    //                                         aria-checked={isOn}
    //                                         onClick={() => dispatch(toggleService(item))}
    //                                         className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0
    //                                             ${isOn ? "bg-[#e8683f]" : "bg-gray-200"}`}
    //                                     >
    //                                         <span
    //                                             className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
    //                                                 ${isOn ? "translate-x-4" : "translate-x-0.5"}`}
    //                                         />
    //                                     </button>
    //                                     <div className="min-w-0">
    //                                         <p className="text-sm font-semibold text-[#1e3a8a] truncate">
    //                                             {item.subServiceName}
    //                                         </p>
    //                                         <p className="text-xs text-gray-400">
    //                                             Suggested: NPR {item.basePrice} {item.pricingUnit ? `/ ${item.pricingUnit}` : ""}
    //                                         </p>
    //                                     </div>
    //                                 </div>
    //
    //                                 {isOn && (
    //                                     <div className="flex items-center gap-1 flex-shrink-0">
    //                                         <span className="text-xs text-gray-400">NPR</span>
    //                                         <input
    //                                             type="number"
    //                                             min={1}
    //                                             value={sel.customPrice}
    //                                             onChange={(e) =>
    //                                                 dispatch(updateServicePrice({ catalogId: item.id, price: Number(e.target.value) }))
    //                                             }
    //                                             className="w-20 px-2 py-1.5 border-2 border-[#1e3a8a]/20 focus:border-[#e8683f]
    //                                                 rounded-lg text-sm font-semibold text-[#1e3a8a] outline-none text-right"
    //                                         />
    //                                     </div>
    //                                 )}
    //                             </div>
    //                         );
    //                     })
    //                 )}
    //             </div>
    //
    //             {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
    //
    //             <div className="flex items-center gap-3 mt-6">
    //                 <button
    //                     onClick={onBack}
    //                     disabled={savingServices}
    //                     className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold
    //                         text-[#1e3a8a] hover:bg-[#1e3a8a]/5 transition-colors disabled:cursor-not-allowed"
    //                 >
    //                     <ArrowLeft size={15} aria-hidden />
    //                     Back
    //                 </button>
    //                 <button
    //                     onClick={handleNext}
    //                     disabled={!canProceed || savingServices}
    //                     className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl
    //                         transition-all duration-200 shadow-md
    //                         ${!canProceed || savingServices
    //                         ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
    //                         : "bg-[#e8683f] text-white hover:bg-[#d95a2f] hover:shadow-lg active:scale-[0.98]"}`}
    //                 >
    //                     {savingServices ? (
    //                         <>
    //                             <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
    //                             <span>Saving…</span>
    //                         </>
    //                     ) : (
    //                         <>
    //                             <span>Continue</span>
    //                             <ArrowRight size={16} aria-hidden />
    //                         </>
    //                     )}
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    "use client";

    import { useEffect, useState } from "react";
    import { useDispatch, useSelector } from "react-redux";
    import { Wrench, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
    import type { RootState, AppDispatch } from "@/store";
    import {
        fetchCatalog,
        toggleService,
        updateServicePrice,
        saveOnboardingServices,
    } from "@/store/slices/providerOnboardingSlice";
    import type { CatalogItem } from "@/lib/api/onboardingApi";

    interface SubServicesStepProps {
        categories: string[]; // was: category: string
        onNext: () => void;
        onBack: () => void;
    }

    export default function SubServicesStep({ categories, onNext, onBack }: SubServicesStepProps) {
        const dispatch = useDispatch<AppDispatch>();
        const { catalogByCategory, selections, loadingCatalog, savingServices, error } = useSelector(
            (s: RootState) => s.providerOnboarding,
        );

        const [activeCategory, setActiveCategory] = useState(categories[0] ?? "");

        // Fetch every certified category's catalog once — guarded per-category so
        // switching tabs back and forth doesn't refetch.
        useEffect(() => {
            categories.forEach((c) => {
                if (!catalogByCategory[c]) dispatch(fetchCatalog(c));
            });
        }, [categories, catalogByCategory, dispatch]);

        const activeCatalog = catalogByCategory[activeCategory] ?? [];
        const totalCatalogItems = categories.reduce(
            (sum, c) => sum + (catalogByCategory[c]?.length ?? 0),
            0,
        );

        // Selections are already global (keyed by catalogId, not by category), so
        // this check correctly spans every certified category, not just the tab
        // currently open.
        const activeSelections = Object.values(selections).filter((s) => s.isAvailable);
        const hasInvalidPrice = activeSelections.some((s) => !s.customPrice || s.customPrice <= 0);
        const allCatalogsLoaded = categories.every((c) => catalogByCategory[c] !== undefined);
        const canProceed =
            (allCatalogsLoaded && totalCatalogItems === 0) ||
            (activeSelections.length > 0 && !hasInvalidPrice);

        const handleNext = async () => {
            if (!canProceed) return;

            if (totalCatalogItems === 0) {
                onNext();
                return;
            }

            const result = await dispatch(saveOnboardingServices());
            if (saveOnboardingServices.fulfilled.match(result)) {
                onNext();
            }
        };

        return (
            <div className="px-8 py-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center">
                        <Wrench size={18} className="text-[#1e3a8a]" aria-hidden />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#1e3a8a]">Set Up Your Services</h2>
                        <p className="text-gray-400 text-xs">
                            Turn on what you offer and set your price. Customers will only see
                            services you've activated.
                        </p>
                    </div>
                </div>

                {categories.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setActiveCategory(c)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors
                                ${activeCategory === c
                                    ? "bg-[#1e3a8a] text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            >
                                {c}
                                {catalogByCategory[c] && (
                                    <span className="ml-1.5 opacity-70">
                                    {Object.values(selections).filter(
                                        (s) => s.isAvailable && catalogByCategory[c].some((item) => item.id === s.catalogId),
                                    ).length}/{catalogByCategory[c].length}
                                </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-5 max-h-[340px] overflow-y-auto pr-1 space-y-2">
                    {loadingCatalog && !catalogByCategory[activeCategory] ? (
                        <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                            Loading services…
                        </div>
                    ) : activeCatalog.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-10">
                            No catalog items found for {activeCategory || "this category"} yet.
                        </p>
                    ) : (
                        activeCatalog.map((item: CatalogItem) => {
                            const sel = selections[item.id];
                            const isOn = !!sel?.isAvailable;
                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 transition-colors
                                    ${isOn ? "border-[#e8683f] bg-[#e8683f]/5" : "border-[#1e3a8a]/10"}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            role="switch"
                                            aria-checked={isOn}
                                            onClick={() => dispatch(toggleService(item))}
                                            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0
                                            ${isOn ? "bg-[#e8683f]" : "bg-gray-200"}`}
                                        >
                                        <span
                                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                                                ${isOn ? "translate-x-4" : "translate-x-0.5"}`}
                                        />
                                        </button>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#1e3a8a] truncate">
                                                {item.subServiceName}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Suggested: NPR {item.basePrice} {item.pricingUnit ? `/ ${item.pricingUnit}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {isOn && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <span className="text-xs text-gray-400">NPR</span>
                                            <input
                                                type="number"
                                                min={1}
                                                value={sel.customPrice}
                                                onChange={(e) =>
                                                    dispatch(updateServicePrice({ catalogId: item.id, price: Number(e.target.value) }))
                                                }
                                                className="w-20 px-2 py-1.5 border-2 border-[#1e3a8a]/20 focus:border-[#e8683f]
                                                rounded-lg text-sm font-semibold text-[#1e3a8a] outline-none text-right"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

                <div className="flex items-center gap-3 mt-6">
                    <button
                        onClick={onBack}
                        disabled={savingServices}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold
                        text-[#1e3a8a] hover:bg-[#1e3a8a]/5 transition-colors disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={15} aria-hidden />
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed || savingServices}
                        className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl
                        transition-all duration-200 shadow-md
                        ${!canProceed || savingServices
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            : "bg-[#e8683f] text-white hover:bg-[#d95a2f] hover:shadow-lg active:scale-[0.98]"}`}
                    >
                        {savingServices ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                <span>Saving…</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <ArrowRight size={16} aria-hidden />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }