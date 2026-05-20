'use client';
import React from 'react'
import { useAppContext } from "@/context/AppContext";
import CustomerCareDashboard from "@/components/dashboard/CustomerCareDashboard";


const Dashboard = () => {

//   const { user } = useAppContext();
//   let parsedUser = null;
//   try {
//     parsedUser = user ? JSON.parse(user) : null;
//   } catch (error) {
//     console.error("Failed to parse user data:", error);
//   }



  return (
    <div>
      <CustomerCareDashboard />
    </div>
  )
}

export default Dashboard;
