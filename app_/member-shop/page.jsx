'use client'
import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MemberShopProductContextProvider } from "@/context/MemberShopProductContext";
import MemberShopProducts from "@/components/MemberShopProducts";
import Loading from "@/components/Loading";

const MemberShopContent = () => {
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

const MemberShop = () => {
  return (
    <Suspense fallback={<Loading />}>
      <MemberShopContent />
    </Suspense>
  );
};

export default MemberShop;
