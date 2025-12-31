'use client'
import React, { Suspense } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProductContextProvider } from "@/context/ProductContext";
import Header from "@/components/Header";
import GeneralProduct from "@/components/GeneralProduct";
import { GeneralProductContextProvider } from "@/context/GeneralProductContext";

const GeneralProductComponent = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneralProductContextProvider>
        <Header />
        <Navbar />
        <div>
          <div className="hidden md:block">
            {/* <HeaderSlider />HeaderSliderNew.jsx */}
            <HeaderSlider />
          </div>
          {/* <HomeProducts /> */}
          <GeneralProduct />
        </div>
        <Footer />
      </GeneralProductContextProvider>
    </Suspense>
  );
};

export default GeneralProductComponent;
