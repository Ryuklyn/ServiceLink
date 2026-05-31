// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "@/utils/axios";
// import Sidebar from "@/components/dashboard/user/UserSidebar";
// import SearchBar from "@/components/dashboard/user/SearchBar";

// interface UserProfile {
//   fullName: string;
//   email: string;
//   profileImage?: string;
// }

// export default function UserDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token =
//           localStorage.getItem("authToken") || localStorage.getItem("token");

//         if (!token) {
//           router.push("/login");
//           return;
//         }

//         const res = await api.get("/auth/me", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setProfile(res.data);
//       } catch (err) {
//         console.error(err);
//         localStorage.removeItem("authToken");
//         localStorage.removeItem("token");
//         router.push("/login");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-[#e8683f] rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!profile) return null;

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar userProfile={profile} />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <SearchBar userProfile={profile} />
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-8 max-w-7xl mx-auto">{children}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Sidebar from "@/components/dashboard/user/UserSidebar";
import SearchBar from "@/components/dashboard/user/SearchBar";

interface UserProfile {
  fullName: string;
  email: string;
  profileImage?: string;
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false); // <-- Added lifecycle hydration flag

  useEffect(() => {
    setHasMounted(true); // Confirms client execution environment safely

    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Ensures no initial markup mismatch layout conflicts occur before mounting
  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-[#e8683f] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userProfile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SearchBar userProfile={profile} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
