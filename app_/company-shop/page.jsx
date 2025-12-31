'use client'
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CompanyShopProductContextProvider } from "@/context/CompanyShopProductContext";
import CompanyShopProducts from "@/components/CompanyShopProducts";

const CompanyShop = () => {
  return (
    <CompanyShopProductContextProvider>
      <Header />
      <Navbar />
      <div>
        <CompanyShopProducts />
      </div>
      <Footer />
    </CompanyShopProductContextProvider>
  );
};

export default CompanyShop;
