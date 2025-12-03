'use client'
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MemberShopProductContextProvider } from "@/context/MemberShopProductContext";
import MemberShopProducts from "@/components/MemberShopProducts";

const MemberShop = () => {
  return (
    <MemberShopProductContextProvider>
      <Header />
      <Navbar />
      <div>
        {/* <div className="hidden md:block">
          <HeaderSlider />
        </div> */}
        <MemberShopProducts />
        {/* <FeaturedProduct /> */}
        {/* <Banner /> */}
        {/* <NewsLetter /> */}
      </div>
      <Footer />
    </MemberShopProductContextProvider>
  );
};

export default MemberShop;
