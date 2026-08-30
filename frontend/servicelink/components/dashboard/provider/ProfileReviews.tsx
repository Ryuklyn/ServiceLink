"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import api from "@/utils/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";

interface Review {
    id: number;
    customerName: string;
    rating: number;
    comment: string;
    serviceName: string;
    punctualityScore: number | null;
    qualityScore: number | null;
    communicationScore: number | null;
    valueScore: number | null;
    isVerifiedBooking: boolean;
    createdAt: string;
}

interface ReviewPage { content: Review[]; totalPages: number; totalElements: number; }
const categoryLabels: Record<string, string> = { punctualityScore: "Punctuality", qualityScore: "Quality", communicationScore: "Communication", valueScore: "Value" };

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={size} className={index < Math.round(rating) ? "fill-[#e8683f] text-[#e8683f]" : "fill-gray-200 text-gray-200"} />)}</div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) {
    return <div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat("en-NP", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

export default function ProfileReviews() {
    const dispatch = useAppDispatch();
    const profile = useAppSelector((state) => state.providerProfile.data);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingFilter, setRatingFilter] = useState("all");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [page, setPage] = useState(0);

    useEffect(() => { if (!profile) dispatch(fetchProviderProfile()); }, [dispatch, profile]);
    useEffect(() => {
        if (!profile?.id) return;
        let cancelled = false;
        setLoading(true);
        api.get<ReviewPage>(`/providers/${profile.id}/reviews`, { params: { page, size: 10 } })
            .then(({ data }) => { if (!cancelled) { setReviews(data.content ?? []); setTotalPages(data.totalPages ?? 0); setTotalReviews(data.totalElements ?? 0); } })
            .catch((err: { message?: string }) => { if (!cancelled) setError(err.message ?? "Could not load reviews."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [profile?.id, page]);

    const services = useMemo(() => Array.from(new Set(reviews.map((review) => review.serviceName).filter(Boolean))), [reviews]);
    const filtered = useMemo(() => {
        const result = reviews.filter((review) => (ratingFilter === "all" || review.rating === Number(ratingFilter)) && (serviceFilter === "all" || review.serviceName === serviceFilter));
        return [...result].sort((a, b) => sortBy === "highest" ? b.rating - a.rating : sortBy === "lowest" ? a.rating - b.rating : new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());
    }, [reviews, ratingFilter, serviceFilter, sortBy]);

    if (!profile && loading) return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading reviews…</div>;

    return <div className="space-y-6">
        <div><h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2><p className="text-sm text-gray-500">Verified feedback from customers who booked your services.</p></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="text-4xl font-bold text-gray-900">{(profile?.averageRating ?? 0).toFixed(1)}</span><div><StarRating rating={profile?.averageRating ?? 0} size={16} /><p className="text-xs text-gray-400">{totalReviews || profile?.totalReviews || 0} reviews</p></div></div></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-3"><Select value={ratingFilter} onChange={(value) => { setRatingFilter(value); setPage(0); }} options={[{ label: "All Ratings", value: "all" }, ...[5, 4, 3, 2, 1].map((rating) => ({ label: `${rating} Stars`, value: String(rating) }))]} /><Select value={serviceFilter} onChange={setServiceFilter} options={[{ label: "All Services", value: "all" }, ...services.map((service) => ({ label: service, value: service }))]} /></div><Select value={sortBy} onChange={setSortBy} options={[{ label: "Most Recent", value: "recent" }, { label: "Highest Rated", value: "highest" }, { label: "Lowest Rated", value: "lowest" }]} /></div>
        {error ? <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div> : loading ? <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading reviews…</div> : filtered.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No reviews match these filters.</div> : <div className="space-y-4">{filtered.map((review) => <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-1.5"><span className="text-sm font-semibold text-gray-900">{review.customerName || "Customer"}</span>{review.isVerifiedBooking && <CheckCircle2 className="h-3.5 w-3.5 fill-[#1e3a8a] text-white" />}</div><span className="text-xs text-gray-500">{review.serviceName || "ServiceLink booking"}</span></div><div className="flex flex-col items-end gap-1"><div className="flex items-center gap-1.5"><StarRating rating={review.rating} /><span className="text-sm font-semibold text-gray-900">{review.rating.toFixed(1)}</span></div><span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span></div></div>{review.comment && <p className="mt-3 text-sm text-gray-600">{review.comment}</p>}<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{(["punctualityScore", "qualityScore", "communicationScore", "valueScore"] as const).map((key) => review[key] != null && <div key={key} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs"><span className="text-gray-500">{categoryLabels[key]}</span><span className="flex items-center gap-0.5 font-semibold text-gray-700">{review[key]}<Star className="h-3 w-3 fill-[#e8683f] text-[#e8683f]" /></span></div>)}</div></div>)}</div>}
        {totalPages > 1 && <div className="flex items-center justify-center gap-2"><button aria-label="Previous page" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="text-sm text-gray-600">{page + 1} / {totalPages}</span><button aria-label="Next page" disabled={page >= totalPages - 1} onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>}
    </div>;
}
