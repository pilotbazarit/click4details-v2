'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MyShopProductContextProvider } from "@/context/MyShopProductContext";
import MyShopProducts from "@/components/MyShopProducts";
import Header from "@/components/Header";
import { UserShopProductContextProvider } from "@/context/UserShopProductContext";
import UserShopProducts from "@/components/UserShopProducts";

const UserShop = () => {
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

export default UserShop;
