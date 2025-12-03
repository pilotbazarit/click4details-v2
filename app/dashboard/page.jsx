
'use client';

import React from "react";
import { ShoppingCart, Users, DollarSign, Package } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import CustomerCareDashboard from "@/components/dashboard/CustomerCareDashboard";

const Dashboard = () => {
  const { user } = useAppContext();
  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  // if (parsedUser?.role_name === 'Customer Care') {
  if (parsedUser?.user_mode === 'pbl') {
    return <CustomerCareDashboard />;
  } else {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Total Sales" value="$25,400" Icon={DollarSign} />
          <DashboardCard title="Orders" value="1,220" Icon={ShoppingCart} />
          <DashboardCard title="Customers" value="870" Icon={Users} />
          <DashboardCard title="Products" value="320" Icon={Package} />
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "#1001", customer: "John Doe", date: "2025-07-06", total: "$120.00", status: "Completed" },
                  { id: "#1002", customer: "Jane Smith", date: "2025-07-05", total: "$90.00", status: "Pending" },
                  { id: "#1003", customer: "Bob Lee", date: "2025-07-04", total: "$45.00", status: "Cancelled" },
                ].map((order, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{order.id}</td>
                    <td className="p-2">{order.customer}</td>
                    <td className="p-2">{order.date}</td>
                    <td className="p-2">{order.total}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
};

const DashboardCard = ({ title, value, Icon }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow flex items-center gap-4">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;