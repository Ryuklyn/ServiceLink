"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // 1. Check URL for token
    const tokenFromUrl = searchParams?.get("token");

    if (tokenFromUrl) {
      // Save it
      localStorage.setItem("authToken", tokenFromUrl);

      // Clean up URL without triggering full reload
      router.replace("/dashboard");
    }

    // 2. Read token from storage
    const storedToken = tokenFromUrl || localStorage.getItem("authToken");

    if (storedToken) {
      try {
        // Decode JWT Payload without external library
        const payloadBase64Url = storedToken.split(".")[1];
        const payloadBase64 = payloadBase64Url
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(payloadBase64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const decoded = JSON.parse(jsonPayload);

        setProfile({
          name: decoded.name || "Unknown User",
          email: decoded.sub || "No Email", // sub is used for email in our backend
          picture: decoded.picture || "",
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("authToken");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-10 mt-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="flex flex-col items-center justify-center space-y-4">
          {profile.picture ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
              <Image
                src={profile.picture}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-800">
            {profile.name}
          </h2>
          <p className="text-gray-500">{profile.email}</p>

          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              router.push("/login");
            }}
            className="mt-8 px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p>Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
