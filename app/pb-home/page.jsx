'use client'
import React, { Suspense, useEffect, useState } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PblHomeProduct from "@/components/PblHomeProduct";
import { PblHomeProductContextProvider } from "@/context/PblHomeProductContext";
import Header from "@/components/Header";
import { parseStoredUser } from "@/lib/parseStoredUser";
import Loading from "@/components/Loading";

const PblHomeContent = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const userInfo = parseStoredUser(localStorage.getItem("user"));
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);


  // console.log("useruseruseruseruseruseruseruser", user);

  return (
    <PblHomeProductContextProvider>
      <Header />
      <Navbar />
      <div>
        <div className="hidden md:block">
          <HeaderSlider />
        </div>
        <PblHomeProduct user={user} />
        {/* <NewsLetter /> */}
      </div>
      {
        !user && (
          <Footer />
        )
      }
    
    </PblHomeProductContextProvider>
  );
};

const PblHome = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PblHomeContent />
    </Suspense>
  );
};

export default PblHome;
