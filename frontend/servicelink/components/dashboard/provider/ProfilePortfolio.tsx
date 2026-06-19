"use client";

import { useState } from "react";
import {
    Plus,
    X,
    UploadCloud,
    Video,
    Calendar,
    MapPin,
    Image as ImageIcon,
    Play,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type Project = {
    id: number;
    title: string;
    category: string;
    date: string;
    location: string;
    photoCount: number;
    hasVideo?: boolean;
};

const initialProjects: Project[] = [
    { id: 1, title: "House Rewiring Project", category: "Electrical Wiring", date: "May 2026", location: "Baneshwor, Kathmandu", photoCount: 3 },
    { id: 2, title: "Office Wiring", category: "Electrical Wiring", date: "Apr 2026", location: "Kuleshwor, Kathmandu", photoCount: 4 },
    { id: 3, title: "Solar Setup Project", category: "Solar Installation", date: "Mar 2026", location: "Lalitpur, Nepal", photoCount: 1, hasVideo: true },
    { id: 4, title: "Distribution Board Upgrade", category: "Electrical Wiring", date: "Feb 2026", location: "Maharajgunj, Kathmandu", photoCount: 5 },
    { id: 5, title: "Outdoor Lighting Installation", category: "Electrical Lighting", date: "Jan 2026", location: "Boudha, Kathmandu", photoCount: 3, hasVideo: true },
    { id: 6, title: "Inverter Installation", category: "Electrical Installation", date: "Jan 2026", location: "Naxal, Kathmandu", photoCount: 2 },
    { id: 7, title: "Kitchen Wiring Setup", category: "Electrical Wiring", date: "Dec 2025", location: "Patan, Lalitpur", photoCount: 4 },
    { id: 8, title: "Security Light Installation", category: "Electrical Lighting", date: "Nov 2025", location: "Bhaktapur, Nepal", photoCount: 3 },
];

const serviceTypes = ["Electrical Wiring", "Electrical Lighting", "Electrical Installation", "Solar Installation"];

export default function ProfilePortfolio() {
    const [projects, setProjects] = useState(initialProjects);
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);

    const [photos, setPhotos] = useState<string[]>([]);
    const [video, setVideo] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [serviceType, setServiceType] = useState(serviceTypes[0]);
    const [description, setDescription] = useState("");
    const [completionDate, setCompletionDate] = useState("");
    const [location, setLocation] = useState("");

    const pageSize = 6;
    const paginated = projects.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(projects.length / pageSize);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 5 - photos.length);
        const urls = files.map((f) => URL.createObjectURL(f));
        setPhotos((prev) => [...prev, ...urls].slice(0, 5));
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setVideo(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setPhotos([]);
        setVideo(null);
        setTitle("");
        setServiceType(serviceTypes[0]);
        setDescription("");
        setCompletionDate("");
        setLocation("");
    };

    const handleSave = () => {
        if (!title.trim()) return;
        const newProject: Project = {
            id: Date.now(),
            title,
            category: serviceType,
            date: completionDate || "—",
            location: location || "—",
            photoCount: photos.length,
            hasVideo: !!video,
        };
        setProjects((prev) => [newProject, ...prev]);
        resetForm();
        setModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Portfolio</h2>
                    <p className="text-sm text-gray-500">Showcase your previous work to build customer trust.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex w-fit items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Work
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((project) => (
                    <div key={project.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="relative h-40 w-full bg-gradient-to-br from-[#1e3a8a]/15 to-[#e8683f]/15">
                            {project.hasVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
                                        <Play className="h-5 w-5 fill-[#1e3a8a] text-[#1e3a8a]" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                                <ImageIcon className="h-3 w-3" />
                                {project.photoCount}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-900">{project.title}</h3>
                            <p className="mt-0.5 text-xs font-medium text-[#1e3a8a]">{project.category}</p>
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {project.date}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="h-3.5 w-3.5" />
                                {project.location}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-gray-500">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, projects.length)} of {projects.length} projects
                </p>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                                page === i + 1 ? "bg-[#1e3a8a] text-white" : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Add Portfolio Work Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Portfolio Work</h3>
                                <p className="text-sm text-gray-500">Showcase your previous work to build customer trust.</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Left: Media */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Photos (Max 5)</label>
                                    <span className="text-xs font-medium text-[#1e3a8a]">{photos.length}/5</span>
                                </div>
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center hover:border-[#1e3a8a]/40">
                                    <UploadCloud className="h-6 w-6 text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-500">
                    Drag & drop photos here or <span className="font-medium text-[#1e3a8a]">Browse Files</span>
                  </span>
                                    <span className="mt-1 text-xs text-gray-400">JPG, PNG up to 5MB each</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                                </label>

                                <div className="mt-3 grid grid-cols-5 gap-2">
                                    {photos.map((src, i) => (
                                        <div key={i} className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                                            <img src={src} alt={`upload-${i}`} className="h-full w-full object-cover" />
                                            <button
                                                onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 5 - photos.length) }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-300"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </div>
                                    ))}
                                </div>

                                <label className="mt-4 mb-2 block text-sm font-medium text-gray-700">Video (Optional)</label>
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-5 text-center hover:border-[#1e3a8a]/40">
                                    <Video className="h-6 w-6 text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-500">
                    Drag & drop video here or <span className="font-medium text-[#1e3a8a]">Browse File</span>
                  </span>
                                    <span className="mt-1 text-xs text-gray-400">MP4, MOV up to 50MB • 1 video max</span>
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                </label>
                                {video && <p className="mt-2 text-xs text-green-600">Video attached ✓</p>}
                            </div>

                            {/* Right: Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Project Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. House Rewiring Project"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Service Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={serviceType}
                                        onChange={(e) => setServiceType(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                                    >
                                        {serviceTypes.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        maxLength={250}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Briefly describe the project..."
                                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">{description.length} / 250</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Completion Date</label>
                                        <div className="relative">
                                            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="month"
                                                value={completionDate}
                                                onChange={(e) => setCompletionDate(e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="e.g. Baneshwor"
                                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-[#1e3a8a]">
                                    Maximum 10 projects allowed in your portfolio. Each project can have up to 5 photos and 1 video.
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="rounded-lg bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]/90"
                                    >
                                        Save Work
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}