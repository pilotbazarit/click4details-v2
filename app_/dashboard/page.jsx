"use client";

import CustomerCareDashboard from "@/components/dashboard/CustomerCareDashboard";
import WelcomeHero from "@/components/WelcomeHero";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import React, { useMemo } from "react";

const Dashboard = () => {
  const { user, permissionList, loading } = useAppContext();

  const parsedUser = useMemo(() => {
    if (!user) {
      return null;
    }
    try {
      return typeof user === "string" ? JSON.parse(user) : user;
    } catch {
      return null;
    }
  }, [user]);

  const showCustomerCareHome = useMemo(() => {
    if (!parsedUser) {
      return false;
    }
    return hasPermission(permissionList, 0, "CustomerCare", "CustomerCareDashboardMenuShow");
  }, [parsedUser, permissionList]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">Loading…</div>
    );
  }

  if (showCustomerCareHome) {
    return <CustomerCareDashboard />;
  }

  return (
    <div>
      <WelcomeHero />
    </div>
  );
};

export default Dashboard;
