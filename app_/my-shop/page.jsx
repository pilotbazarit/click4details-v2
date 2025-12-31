'use client'
import React, { useEffect } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MyShopProductContextProvider } from "@/context/MyShopProductContext";
import MyShopProducts from "@/components/MyShopProducts";
import Header from "@/components/Header";

const MyShop = () => {


  return (
    <MyShopProductContextProvider>
      <Header />
      <Navbar />
      <div>
        {/* <div className="hidden md:block">
          <HeaderSlider />
        </div> */}
        <MyShopProducts />
        {/* <FeaturedProduct /> */}
        {/* <Banner /> */}
        {/* <NewsLetter /> */}
      </div>
      <Footer />
    </MyShopProductContextProvider>
  );
};

export default MyShop;
