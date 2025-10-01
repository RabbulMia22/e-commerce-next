"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FaShoppingCart, FaUserCircle, FaHome, FaThLarge } from "react-icons/fa";

function Navbar() {
    const [search, setSearch] = useState("");

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            {/* Desktop */}
            <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex-shrink-0 text-2xl font-bold text-white cursor-pointer bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-2 rounded-lg">
                    ShopMate
                </div>

                {/* Search */}
                <div className="flex flex-1 max-w-xl mx-6">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md 
             focus:outline-none focus:ring-2 focus:ring-indigo-500 
             text-black placeholder:text-gray-400"
                    />

                    <button className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition">
                        Search
                    </button>
                </div>

                {/* Links */}
                <div className="flex items-center space-x-6">
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Home</a>
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Shop</a>
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Deals</a>
                    <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">Dashboard</Link>
                </div>

                {/* Account & Cart */}
                <div className="flex items-center space-x-4">
                    <FaUserCircle size={24} className="text-gray-700 hover:text-indigo-600 cursor-pointer" />
                    <div className="relative cursor-pointer text-gray-700 hover:text-indigo-600">
                        <FaShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">3</span>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-white z-50 px-4 py-2 shadow">
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 text-black px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-black"
                    />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition">
                        Search
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navbar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-inner flex justify-around items-center h-16 z-50">
                <a href="#" className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600">
                    <FaHome size={20} />
                    <span className="text-xs">Home</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600">
                    <FaThLarge size={20} />
                    <span className="text-xs">Categories</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600 relative">
                    <FaShoppingCart size={20} />
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">3</span>
                    <span className="text-xs mt-1">Cart</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600">
                    <FaUserCircle size={20} />
                    <span className="text-xs mt-1">Dashboard</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600">
                    <FaUserCircle size={20} />
                    <span className="text-xs mt-1">Account</span>
                </a>
            </div>

            {/* Spacer for Mobile */}
            <div className="md:hidden h-28"></div>
        </nav>
    );
}

export default Navbar;
