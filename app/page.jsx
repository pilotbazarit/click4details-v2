'use client'
import React, { Suspense } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WelcomeHero from "@/components/WelcomeHero";
import { ProductContextProvider } from "@/context/ProductContext";
import Header from "@/components/Header";
import MouseTrail from "@/components/MouseTrail";
import Loading from "@/components/Loading";

const HomeContent = () => {
  return (
    <ProductContextProvider>
      {/* <MouseTrail /> */}
      <Header />
      <Navbar />
      <div>
        <div className="hidden md:block">
          {/* <HeaderSlider />HeaderSliderNew.jsx */}
          <HeaderSlider />
        </div>
        <HomeProducts />
      </div>
      <Footer />
    </ProductContextProvider>
  );
};

const Home = () => {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
};

export default Home;
