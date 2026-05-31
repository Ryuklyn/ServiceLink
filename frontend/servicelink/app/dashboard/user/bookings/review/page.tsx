"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
} from "lucide-react";

interface SubRatings {
  punctuality: number;
  quality: number;
  communication: number;
  value: number;
}

export default function ReviewFeedbackPage() {
  // Interactive State hooks for dynamic star selection
  const [overallRating, setOverallRating] = useState<number>(3);
  const [subRatings, setSubRatings] = useState<SubRatings>({
    punctuality: 0,
    quality: 0,
    communication: 0,
    value: 0,
  });
  const [reviewText, setReviewText] = useState<string>("");
  const [rebookOption, setRebookOption] = useState<string | null>(null);

  // Helper to handle sub-category rating clicks
  const handleSubRatingChange = (
    category: keyof SubRatings,
    rating: number,
  ) => {
    setSubRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const characterLimit = 500;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans antialiased text-gray-800">
      {/* 1. Fixed Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1e3a8a] text-white shadow-md">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="p-1 hover:bg-blue-800 rounded-full transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-semibold text-sm tracking-wide text-gray-200 uppercase">
                Write a Review
              </h1>
              <p className="text-base font-bold text-white">Booking Feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm bg-blue-900/50 px-3 py-1.5 rounded-md border border-blue-700/50">
            <Clock className="w-4 h-4 text-[#e8683f]" />
            <span className="font-medium text-gray-100">May 18, 2026</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 mt-6 space-y-5">
        {/* 2. Provider Info Card */}
        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold text-lg tracking-wider shrink-0 shadow-inner">
            CA
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              CoolBreeze AC Service
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Review for: AC Service
            </p>
          </div>
        </section>

        {/* 3. Overall Rating Card */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center space-y-3">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
            Overall Rating
          </h3>

          {/* Interactive Dynamic Star Row */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <button
                key={starIndex}
                type="button"
                onClick={() => setOverallRating(starIndex)}
                className="transition-transform active:scale-95 focus:outline-none p-1"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    starIndex <= overallRating
                      ? "text-[#e8683f] fill-[#e8683f]"
                      : "text-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-bold text-gray-500 mt-1">
            {overallRating} / 5
          </p>
        </section>

        {/* 4. Sub-Category Granular Metrics Breakdown */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          {(Object.keys(subRatings) as Array<keyof SubRatings>).map(
            (category) => {
              // Text transformation logic from camelCase to Title Case
              const formattedLabel = category
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return (
                <div
                  key={category}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm font-medium text-gray-600">
                    {formattedLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <button
                        key={starIndex}
                        type="button"
                        onClick={() =>
                          handleSubRatingChange(category, starIndex)
                        }
                        className="focus:outline-none transition-transform active:scale-90"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            starIndex <= subRatings[category]
                              ? "text-[#e8683f] fill-[#e8683f]"
                              : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </section>

        {/* 5. Qualitative Feedback Text Area */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-2">
          <label
            htmlFor="review-textarea"
            className="block text-sm font-bold text-gray-900"
          >
            Share your experience with others
          </label>
          <div className="relative">
            <textarea
              id="review-textarea"
              maxLength={characterLimit}
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Was the provider on time? Was the work quality up to your expectations? Would you recommend them?"
              className="w-full text-sm border border-gray-200 rounded-xl p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1 font-medium">
              {reviewText.length} / {characterLimit}
            </div>
          </div>
        </section>

        {/* 6. Rebook Retention Query Selector */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h4 className="text-sm font-bold text-gray-900 text-center sm:text-left">
            Would you book this provider again?
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRebookOption("yes")}
              className={`flex items-center justify-center gap-2 border text-sm font-bold p-3 rounded-xl transition duration-150 active:scale-[0.99] ${
                rebookOption === "yes"
                  ? "bg-blue-50 border-[#1e3a8a] text-[#1e3a8a]"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ThumbsUp className="w-4 h-4 shrink-0" /> Yes — Definitely
            </button>
            <button
              type="button"
              onClick={() => setRebookOption("no")}
              className={`flex items-center justify-center gap-2 border text-sm font-bold p-3 rounded-xl transition duration-150 active:scale-[0.99] ${
                rebookOption === "no"
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ThumbsDown className="w-4 h-4 shrink-0" /> No, I wouldn't
            </button>
          </div>
        </section>

        {/* 7. Submission System Actions */}
        <div className="pt-2 space-y-3 text-center">
          <button
            type="submit"
            className="w-full bg-[#e8683f] hover:bg-[#d5572f] text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Submit Review
          </button>

          <button
            type="button"
            className="inline-block text-xs font-bold text-gray-400 hover:text-gray-600 py-2 transition"
          >
            Skip for now
          </button>
        </div>
      </main>
    </div>
  );
}
