"use client";
import useAdmin from "@/hooks/useAdmin";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaShoppingCart, FaUserCircle, FaHome, FaThLarge } from "react-icons/fa";

function Navbar() {
    const [search, setSearch] = useState("");
    const { basket, hydrated } = useHydratedStore();
    const { data: session } = useSession();
    const [account, setAccount] = useState(false);
    const { loading, isAdmin } = useAdmin();
    const pathname = usePathname();
    console.log("Admin Status:", isAdmin);
    console.log("Session Data:", session);

    // Navigation items
    const navItems = [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        { name: "Deals", href: "/deals" },
        { 
            name: isAdmin ? "Dashboard" : "My Orders", 
            href: isAdmin ? "/dashboard" : "/orders" 
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-16 bg-white shadow-md">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    // Calculate total items in basket only after hydration
    const totalItems = hydrated ? basket.reduce((total, item) => total + item.quantity, 0) : 0;

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            {/* Desktop */}
            <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between">

                <Link href="/" className="flex-shrink-0 text-2xl font-bold text-white cursor-pointer bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-2 rounded-lg">
                    ShopMate
                </Link>

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
                <div className="flex items-center space-x-6 relative">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`relative px-3 py-2 font-medium transition-all duration-200 group ${
                                pathname === item.href
                                    ? "text-indigo-600"
                                    : "text-gray-700 hover:text-indigo-600"
                            }`}
                        >
                            {item.name}
                            {/* Active underline */}
                            {pathname === item.href && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-full"
                                    layoutId="navbar-underline"
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30,
                                    }}
                                />
                            )}
                            {/* Hover underline */}
                            {pathname !== item.href && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Account & Cart */}
                <div className="flex items-center space-x-4">
                    <div className="relative inline-block text-left">
                        {/* Icon */}
                        <FaUserCircle
                            size={28}
                            onClick={() => setAccount(!account)}
                            className="text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors"
                        />

                        {/* Dropdown */}
                        {account && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                    <p
                                        onClick={() => setAccount(!account)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        My Account
                                    </p>
                                    {session ? (
                                        <p
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        >
                                            Logout
                                        </p>
                                    ) : (
                                        <Link
                                            onClick={() => setAccount(!account)}
                                            href="/authentication/login"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link href="/cart" className="relative cursor-pointer text-gray-700 hover:text-indigo-600">
                        <FaShoppingCart size={24} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                                {totalItems > 99 ? '99+' : totalItems}
                            </span>
                        )}
                    </Link>
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
                <Link 
                    href="/" 
                    className={`flex flex-col items-center justify-center relative transition-colors duration-200 ${
                        pathname === "/" ? "text-indigo-600" : "text-gray-700"
                    }`}
                >
                    <FaHome size={20} />
                    <span className="text-xs">Home</span>
                    {pathname === "/" && (
                        <motion.div
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-full"
                            layoutId="mobile-navbar-indicator"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                            }}
                        />
                    )}
                </Link>
                
                <a href="#" className={`flex flex-col items-center justify-center relative transition-colors duration-200 text-gray-700`}>
                    <FaThLarge size={20} />
                    <span className="text-xs">Categories</span>
                </a>
                
                <Link 
                    href="/cart" 
                    className={`flex flex-col items-center justify-center relative transition-colors duration-200 ${
                        pathname === "/cart" ? "text-indigo-600" : "text-gray-700"
                    }`}
                >
                    <FaShoppingCart size={20} />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                            {totalItems > 99 ? '99+' : totalItems}
                        </span>
                    )}
                    <span className="text-xs mt-1">Cart</span>
                    {pathname === "/cart" && (
                        <motion.div
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-full"
                            layoutId="mobile-navbar-indicator"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                            }}
                        />
                    )}
                </Link>
                
                <Link 
                    href={isAdmin ? "/dashboard" : "/orders"} 
                    className={`flex flex-col items-center justify-center relative transition-colors duration-200 ${
                        pathname === (isAdmin ? "/dashboard" : "/orders") ? "text-indigo-600" : "text-gray-700"
                    }`}
                >
                    <FaUserCircle size={20} />
                    <span className="text-xs mt-1">{isAdmin ? "Dashboard" : "Orders"}</span>
                    {pathname === (isAdmin ? "/dashboard" : "/orders") && (
                        <motion.div
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-full"
                            layoutId="mobile-navbar-indicator"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                            }}
                        />
                    )}
                </Link>
                
                <div className={`flex flex-col items-center justify-center relative transition-colors duration-200 ${
                    account ? "text-indigo-600" : "text-gray-700"
                }`}>
                    <FaUserCircle 
                        size={20} 
                        onClick={() => setAccount(!account)}
                        className="cursor-pointer"
                    />
                    <span className="text-xs mt-1">Account</span>
                </div>
            </div>

            {/* Spacer for Mobile */}
            <div className="md:hidden h-28"></div>
        </nav>
    );
}

export default Navbar;
