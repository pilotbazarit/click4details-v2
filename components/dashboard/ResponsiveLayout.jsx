'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import SideBar from './Sidebar';

const ResponsiveLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile hamburger menu */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white rounded-md shadow-md hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <SideBar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 lg:ml-0 overflow-auto">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile */}
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout; 