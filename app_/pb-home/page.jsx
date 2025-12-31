'use client'
import React, { useContext, useEffect, useState } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PblHomeProduct from "@/components/PblHomeProduct";
import { PblHomeProductContextProvider } from "@/context/PblHomeProductContext";
import Header from "@/components/Header";

const PblHome = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userInfo = userData && JSON.parse(userData);
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  return (
    <PblHomeProductContextProvider>
      <Header />
      <Navbar />
      <div>
        <div className="hidden md:block">
          <HeaderSlider />
        </div>
        <PblHomeProduct />
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

export default PblHome;
