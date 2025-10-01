"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  FiSettings,
  FiLogOut,
  FiX,
  FiMenu,
  FiHome,
  FiUser,
  FiBox,
  FiBarChart2,
  FiImage
} from "react-icons/fi";
import { usePathname } from "next/navigation";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: <FiHome /> },
    { href: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/dashboard/addProducts", label: "Add Products", icon: <FiBox /> },
    { href: "/dashboard/users", label: "Users", icon: <FiUser /> },
    { href: "/dashboard/reports", label: "Reports", icon: <FiBarChart2 /> },
    { href: "/dashboard/bannerOffers", label: "Banner Offers", icon: <FiImage /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div className="flex bg-gray-100">
      {sidebarOpen && (
        <div
          className=" fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 md:z-0 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-blue-600 p-2 rounded-lg shadow-md">
              <FiSettings className="text-white" />
            </span>
            Admin Panel
          </h1>

          {/* Close button (only for mobile, inside sidebar header) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2"
           onClick={() => setSidebarOpen(false)}
          >
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="mt-auto">
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 shadow-md">
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Toggle button (only when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-black p-2  hover:bg-gray-100 transition-colors duration-200 fixed top-2 left-4 z-40 shadow-md  "
        >
          <FiMenu className="text-2xl" />
        </button>
      )}
      </div>
    </>
  );
}

export default Sidebar;
