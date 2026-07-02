'use client'
import React, { Suspense } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MyShopProductContextProvider } from "@/context/MyShopProductContext";
import MyShopProducts from "@/components/MyShopProducts";
import Header from "@/components/Header";
import { UserShopProductContextProvider } from "@/context/UserShopProductContext";
import UserShopProducts from "@/components/UserShopProducts";
import Loading from "@/components/Loading";

const UserShopContent = () => {
  return (
    <UserShopProductContextProvider>
      <Header />
      <Navbar />
      <div>
        {/* <div className="hidden md:block">
          <HeaderSlider />
        </div> */}
        <UserShopProducts />
        {/* <FeaturedProduct /> */}
        {/* <Banner /> */}
        {/* <NewsLetter /> */}
      </div>
      <Footer />
    </UserShopProductContextProvider>
  );
};

const UserShop = () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserShopContent />
    </Suspense>
  );
};

export default UserShop;
