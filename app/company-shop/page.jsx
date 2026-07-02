'use client'
import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CompanyShopProductContextProvider } from "@/context/CompanyShopProductContext";
import CompanyShopProducts from "@/components/CompanyShopProducts";

const CompanyShopContent = () => {
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

const CompanyShop = () => {
  return (
    <Suspense fallback={null}>
      <CompanyShopContent />
    </Suspense>
  );
};

export default CompanyShop;