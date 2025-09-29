"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navbar / Menu Button */}
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-indigo-600 md:hidden"
          >
            {/* You can use an icon here */}
            
          </button>

          {/* Page Title */}
          <h1 className="text-xl font-semibold text-black">Dashboard</h1>

          {/* Right Side (Profile / Notifications etc.) */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-indigo-600">🔔</button>
            <button className="text-gray-600 hover:text-indigo-600">👤</button>
          </div>
        </header>


        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
