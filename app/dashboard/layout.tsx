"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import useAdmin from '@/hooks/useAdmin';
import { Loader2, AlertCircle } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, isAdmin, error, user } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!isAdmin || error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-semibold">{error || "Access Denied. Admins Only."}</h2>
        {user?.email && <p className="text-gray-500">{user.email}</p>}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          {/* Left: Menu toggle */}
          

          {/* Center: Page Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{`Welcome, ${user?.name}`}</h1>
            <p className="text-gray-500 mt-1">Admin Dashboard</p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-gray-200 transition">👤</button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
