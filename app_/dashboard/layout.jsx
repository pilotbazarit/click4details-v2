"use client";
import Navbar from "@/components/Navbar";
import ResponsiveLayout from "@/components/dashboard/ResponsiveLayout";
import React from "react";

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <ResponsiveLayout>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </ResponsiveLayout>
    </div>
  );
};

export default Layout;
