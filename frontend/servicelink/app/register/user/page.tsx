// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Mail, Lock, Eye, Briefcase } from "lucide-react";

// export default function SignupPage() {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleEmailContinue = () => {
//     if (email.includes("@")) {
//       setStep(2); // simulate email validation success
//     } else {
//       alert("Enter a valid email");
//     }
//   };

//   return (
//     <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
//       {/* LEFT SIDE (same as login) */}
//       <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
//         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
//         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>

//         <div className="relative z-10 max-w-sm flex flex-col items-center">
//           {/* Main Icon */}
//           <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-orange-500/30">
//             <Briefcase className="w-12 h-12 text-white" strokeWidth={1.5} />
//           </div>
//           <h1 className="text-4xl font-bold mb-4 tracking-tight">
//             Join Us Today
//           </h1>
//           <p className="text-blue-100 text-lg leading-relaxed">
//             Create your account and start connecting with trusted services.
//           </p>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 lg:py-16 overflow-y-auto">
//         <div className="w-full max-w-md mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">
//               Create your account
//             </h2>
//           </div>

//           {/* GOOGLE BUTTON */}
//           <button
//             onClick={() =>
//               (window.location.href =
//                 "http://localhost:8080/oauth2/authorization/google")
//             }
//             className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//           >
//             <img
//               src="https://developers.google.com/identity/images/g-logo.png"
//               alt="Google"
//               className="w-5 h-5"
//             />
//             Continue with Google
//           </button>

//           {/* OR */}
//           <div className="mt-6 relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-200"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-3 bg-white text-gray-400 text-xs uppercase">
//                 OR
//               </span>
//             </div>
//           </div>

//           {/* STEP FORM */}
//           <div className="mt-6 space-y-5">
//             {/* EMAIL STEP */}
//             <div>
//               <label className="text-sm font-medium text-gray-700">Email</label>

//               <div className="relative mt-2">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>

//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={step === 2}
//                   className="block w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 outline-none"
//                   placeholder="Email"
//                 />

//                 {step === 2 && (
//                   <button
//                     onClick={() => setStep(1)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
//                   >
//                     Edit
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* PASSWORD STEP (only after email verified) */}
//             {step === 2 && (
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Password
//                 </label>

//                 <div className="relative mt-2">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>

//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 outline-none"
//                     placeholder="Password"
//                   />

//                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
//                     <Eye className="h-5 w-5" />
//                   </div>
//                 </div>

//                 <ul className="text-sm text-gray-500 mt-2 space-y-1">
//                   <li>• at least 8 characters</li>
//                   <li>• a number (0–9)</li>
//                 </ul>
//                 <Link href="/login" className="w-full">
//                   <button className="w-full py-3.5 rounded-xl border border-transparent shadow-sm text-sm font-bold text-white bg-[#1e293b] hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] transition-colors">
//                     Continue
//                   </button>
//                 </Link>
//               </div>
//             )}

//             {/* CONTINUE / CREATE BUTTON */}
//             {step === 1 ? (
//               <button
//                 onClick={handleEmailContinue}
//                 className="w-full py-3.5 rounded-xl bg-gray-300 text-gray-700 font-medium  border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1e293b] hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] transition-colors"
//               >
//                 Continue
//               </button>
//             ) : (
//               <button className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800">
//                 Create your account
//               </button>
//             )}
//           </div>

//           {/* FOOTER */}
//           <p className="mt-8 text-center text-sm text-gray-500">
//             Already have an account?{" "}
//             <Link
//               href="/login"
//               className="font-bold text-[#ea580c] hover:underline"
//             >
//               Log in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, Briefcase } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // simple email validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailContinue = () => {
    if (!isValidEmail(email)) {
      alert("Enter a valid email");
      return;
    }
    setStep(2);
  };

  const handleSignup = async () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      // 👉 TODO: connect your Spring Boot API here
      // await fetch("/api/signup", { method: "POST", body: JSON.stringify({ email, password }) });

      // redirect after success
      router.push("/login?registered=true");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>

        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-orange-500/30">
            <Briefcase className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Join Us Today
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Create your account and start connecting with trusted services.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 lg:py-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Create your account
            </h2>
          </div>

          {/* GOOGLE */}
          <button
            onClick={() =>
              (window.location.href =
                "http://localhost:8080/oauth2/authorization/google")
            }
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400 text-xs uppercase">
                OR
              </span>
            </div>
          </div>

          {/* FORM */}
          <div className="mt-6 space-y-5">
            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-2">
                {/* Left Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>

                {/* Input */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={step === 2}
                  className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="you@email.com"
                />

                {/* Right Button */}
                {step === 2 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            {step === 2 && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative mt-2">
                  {/* Left Icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Input */}
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl 
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               text-gray-900 placeholder-gray-400 outline-none"
                    placeholder="Enter your password"
                  />

                  {/* Eye Toggle */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Eye
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
                    />
                  </div>
                </div>

                <ul className="text-sm text-gray-500 mt-4 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• Includes a number (0–9)</li>
                </ul>
              </div>
            )}

            {/* BUTTON */}
            {step === 1 ? (
              <button
                onClick={handleEmailContinue}
                className="w-full py-3.5 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-[#1e3a8a] transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSignup}
                className="w-full py-3.5 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-[#1e3a8a] transition-colors"
              >
                Create your account
              </button>
            )}
          </div>

          {/* FOOTER */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#ea580c] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
