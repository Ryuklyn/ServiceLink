// import { useEffect, useState } from "react";
// import API from "../services/api";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Categories from "@/components/home/Categories";
import FeaturedServices from "@/components/home/FeaturedServices";
import WhyServiceLink from "@/components/home/WhyServiceLink";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function Home() {
  // const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   API.get("/users")
  //     .then((res) => {
  //       console.log("DATA:", res.data);
  //       setUsers(res.data);
  //     })
  //     .catch((err) => console.log("ERROR:", err));
  // }, []);

  return (
    <div className="font-sans antialiased text-gray-900 bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Categories />
        <FeaturedServices />
        <WhyServiceLink />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
