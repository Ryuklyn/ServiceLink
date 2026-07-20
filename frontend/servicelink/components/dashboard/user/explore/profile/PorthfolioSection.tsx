// "use client";
//
// import { ProviderData } from "./types";
//
// interface PortfolioSectionProps {
//   provider: ProviderData;
// }
//
// export default function PortfolioSection({ provider }: PortfolioSectionProps) {
//   return (
//     <div className="bg-white border border-gray-100 rounded-2xl p-6">
//       <h2 className="font-bold text-gray-900 text-lg mb-4">Portfolio</h2>
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//         {provider.portfolio.map((item) => (
//           <div
//             key={item.label}
//             className="relative h-36 rounded-xl overflow-hidden cursor-pointer group"
//             style={{ background: item.gradient }}
//           >
//             <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200" />
//             <div className="absolute bottom-0 left-0 right-0 p-3">
//               <p className="text-white text-sm font-semibold drop-shadow">
//                 {item.label}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
    X,
    Calendar,
    MapPin,
    Image as ImageIcon,
    Play,
    ChevronLeft,
    ChevronRight,
    Eye,
} from "lucide-react";
import { ProviderData } from "./types";
import type { PortfolioProject } from "@/types/portfolio";

interface PortfolioSectionProps {
    provider: ProviderData;
}

function PortfolioViewerModal({
                                  project,
                                  onClose,
                              }: {
    project: PortfolioProject;
    onClose: () => void;
}) {
    const media = project.media ?? [];
    const [index, setIndex] = useState(0);
    const current = media[index];

    const next = () => setIndex((i) => (i + 1) % media.length);
    const prev = () => setIndex((i) => (i - 1 + media.length) % media.length);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media.length]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex items-center justify-center bg-gray-950" style={{ aspectRatio: "16/10" }}>
                    {current?.type === "VIDEO" ? (
                        <video src={current.url} controls autoPlay className="max-h-full max-w-full" />
                    ) : current ? (
                        <img src={current.url} alt={project.title} className="max-h-full max-w-full object-contain" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
                            No media attached
                        </div>
                    )}

                    {media.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
                                aria-label="Next"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {media.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setIndex(i)}
                                        className={`h-1.5 rounded-full transition-all ${
                                            i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                                        }`}
                                        aria-label={`Go to media ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {media.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto border-b border-gray-100 p-3">
                        {media.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                                    i === index ? "border-[#1e3a8a]" : "border-transparent opacity-70 hover:opacity-100"
                                }`}
                            >
                                {m.type === "VIDEO" ? (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-900">
                                        <Play className="h-4 w-4 fill-white text-white" />
                                    </div>
                                ) : (
                                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                    <p className="mt-0.5 text-sm font-medium text-[#1e3a8a]">{project.serviceCategory}</p>
                    {project.description && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">{project.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {project.completionDate ?? "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {project.location || "—"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PortfolioSection({ provider }: PortfolioSectionProps) {
    const [viewProject, setViewProject] = useState<PortfolioProject | null>(null);
    const projects = provider.portfolio ?? [];

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Portfolio</h2>

            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                    This provider hasn&apos;t added any portfolio work yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => {
                        const coverPhoto = project.media?.find((m) => m.type === "IMAGE");
                        return (
                            <div
                                key={project.id}
                                onClick={() => setViewProject(project)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="relative h-32 sm:h-36 w-full bg-gradient-to-br from-[#1e3a8a]/15 to-[#e8683f]/15">
                                    {coverPhoto && (
                                        <img
                                            src={coverPhoto.url}
                                            alt={project.title}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                    {project.hasVideo && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow">
                                                <Play className="h-4 w-4 fill-[#1e3a8a] text-[#1e3a8a]" />
                                            </div>
                                        </div>
                                    )}
                                    {project.photoCount > 0 && (
                                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                                            <ImageIcon className="h-3 w-3" />
                                            {project.photoCount}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/20 group-hover:opacity-100">
                                        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow">
                                            <Eye className="h-3 w-3" />
                                            View
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{project.title}</p>
                                    <p className="mt-0.5 text-xs font-medium text-[#1e3a8a]">{project.serviceCategory}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewProject && (
                <PortfolioViewerModal project={viewProject} onClose={() => setViewProject(null)} />
            )}
        </div>
    );
}
