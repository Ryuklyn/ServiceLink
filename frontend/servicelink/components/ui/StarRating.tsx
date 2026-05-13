import { Star } from "lucide-react";

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={
            s <= Math.floor(rating)
              ? "fill-[#e8683f] text-[#e8683f]"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}
