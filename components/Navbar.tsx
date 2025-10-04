"use client";
import useAdmin from "@/hooks/useAdmin";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaUserCircle, FaHome, FaThLarge } from "react-icons/fa";

function Navbar() {
    const [search, setSearch] = useState("");
    const { basket, hydrated } = useHydratedStore();
    const { data: session } = useSession();
    const [account, setAccount] = useState(false);
    const { loading, isAdmin } = useAdmin();
    const pathname = usePathname();
    const router = useRouter();
    const accountRef = useRef<HTMLDivElement>(null);
    const desktopAccountRef = useRef<HTMLDivElement>(null);
    console.log("Admin Status:", isAdmin);
    console.log("Session Data:", session);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                accountRef.current && 
                !accountRef.current.contains(event.target as Node) &&
                desktopAccountRef.current && 
                !desktopAccountRef.current.contains(event.target as Node)
            ) {
                setAccount(false);
            }
        };

        if (account) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [account]);

    // Handle search functionality
    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (search.trim()) {
            // Navigate to products page with search query
            router.push(`/products?search=${encodeURIComponent(search.trim())}`);
        }
    };

    // Handle Enter key press in search input
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Navigation items
    const navItems = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
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
                <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-6">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md 
             focus:outline-none focus:ring-2 focus:ring-indigo-500 
             text-black placeholder:text-gray-400"
                    />

                    <button 
                        type="button"
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition"
                    >
                        Search
                    </button>
                </form>

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
                    <div className="relative inline-block text-left" ref={desktopAccountRef}>
                        {/* Icon */}
                        <FaUserCircle
                            size={28}
                            onClick={() => setAccount(!account)}
                            className="text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors"
                        />

                        {/* Desktop Dropdown */}
                        <AnimatePresence>
                            {account && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="py-1">
                                        {/* User Info Section */}
                                        {session && (
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {session.user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {session.user?.email}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <Link
                                            href="/orders"
                                            onClick={() => setAccount(false)}
                                            className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-100"
                                        >
                                            My Orders
                                        </Link>
                                        {session ? (
                                            <button
                                                onClick={async () => {
                                                    setAccount(false);
                                                    try {
                                                        console.log('Starting logout process...');
                                                        
                                                        // Production-aware logout with home page redirect
                                                        const baseUrl = process.env.NODE_ENV === 'production' 
                                                            ? 'https://e-commerce-next-wine.vercel.app'
                                                            : window.location.origin;
                                                        
                                                        console.log('Base URL for logout:', baseUrl);
                                                        
                                                        // Clear session and redirect
                                                        const result = await signOut({ 
                                                            callbackUrl: `${baseUrl}/`,
                                                            redirect: false // Handle redirect manually for better control
                                                        });
                                                        
                                                        console.log('SignOut result:', result);
                                                        
                                                        // Clear any remaining session data
                                                        if (typeof window !== 'undefined') {
                                                            localStorage.clear();
                                                            sessionStorage.clear();
                                                        }
                                                        
                                                        // Force redirect to home page after logout
                                                        setTimeout(() => {
                                                            console.log('Redirecting to:', `${baseUrl}/`);
                                                            window.location.href = `${baseUrl}/`;
                                                        }, 100); // Faster redirect
                                                        
                                                    } catch (error) {
                                                        console.error('Logout error:', error);
                                                        // Fallback: redirect to home page
                                                        const fallbackUrl = process.env.NODE_ENV === 'production' 
                                                            ? 'https://e-commerce-next-wine.vercel.app/'
                                                            : '/';
                                                        console.log('Fallback redirect to:', fallbackUrl);
                                                        window.location.href = fallbackUrl;
                                                    }
                                                }}
                                                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                                            >
                                                Logout
                                            </button>
                                        ) : (
                                            <Link
                                                onClick={() => setAccount(false)}
                                                href="/authentication/login"
                                                className="block px-4 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                                            >
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                <form onSubmit={handleSearch} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="flex-1 text-black px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-black"
                    />
                    <button 
                        type="button"
                        onClick={handleSearch}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition"
                    >
                        Search
                    </button>
                </form>
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
                
                
                <div 
                    ref={accountRef}
                    className={`relative flex flex-col items-center justify-center transition-colors duration-200 ${
                        account ? "text-indigo-600" : "text-gray-700"
                    }`}
                >
                    <FaUserCircle 
                        size={20} 
                        onClick={() => setAccount(!account)}
                        className="cursor-pointer hover:text-indigo-600 transition-colors duration-200"
                    />
                    <span className="text-xs mt-1">Account</span>
                    
                    {/* Active indicator */}
                    {pathname === "/authentication/login" && (
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

                    {/* Enhanced Mobile Dropdown */}
                    <AnimatePresence>
                        {account && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ 
                                    duration: 0.2, 
                                    ease: [0.4, 0, 0.2, 1],
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300
                                }}
                                className="absolute bottom-full mb-4 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[70] left-1/2 transform -translate-x-1/2 overflow-hidden backdrop-blur-sm"
                                style={{ 
                                    filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.15))',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                }}
                            >
                                {/* Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-60"></div>
                                
                                {/* Arrow pointing down */}
                                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-white"></div>
                                    <div className="w-0 h-0 border-l-[11px] border-r-[11px] border-t-[11px] border-l-transparent border-r-transparent border-t-gray-200 absolute -top-[1px] left-1/2 transform -translate-x-1/2 -z-10"></div>
                                </div>
                                
                                <div className="relative z-20 py-2">
                                    {/* User Info Section */}
                                    {session && (
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <FaUserCircle className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {session.user?.name || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-600 truncate">
                                                        {session.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Link
                                            href="/orders"
                                            onClick={() => setAccount(false)}
                                            className="flex items-center px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 text-sm font-medium group"
                                        >
                                            <div className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                                                <FaUserCircle className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors duration-200" />
                                            </div>
                                            My Orders
                                        </Link>
                                        
                                        {session ? (
                                            <button
                                                onClick={async () => {
                                                    setAccount(false);
                                                    try {
                                                        console.log('Starting mobile logout process...');
                                                        
                                                        // Production-aware mobile logout with home page redirect
                                                        const baseUrl = process.env.NODE_ENV === 'production' 
                                                            ? 'https://e-commerce-next-wine.vercel.app'
                                                            : window.location.origin;
                                                        
                                                        console.log('Mobile base URL for logout:', baseUrl);
                                                        
                                                        // Clear session and redirect for mobile
                                                        const result = await signOut({ 
                                                            callbackUrl: `${baseUrl}/`,
                                                            redirect: false // Handle redirect manually for mobile
                                                        });
                                                        
                                                        console.log('Mobile SignOut result:', result);
                                                        
                                                        // Clear any remaining session data for mobile
                                                        if (typeof window !== 'undefined') {
                                                            localStorage.clear();
                                                            sessionStorage.clear();
                                                        }
                                                        
                                                        // Force redirect to home page after logout for mobile
                                                        setTimeout(() => {
                                                            console.log('Mobile redirecting to:', `${baseUrl}/`);
                                                            window.location.href = `${baseUrl}/`;
                                                        }, 50); // Very fast for mobile
                                                        
                                                    } catch (error) {
                                                        console.error('Mobile logout error:', error);
                                                        // Fallback: redirect to home page
                                                        const fallbackUrl = process.env.NODE_ENV === 'production' 
                                                            ? 'https://e-commerce-next-wine.vercel.app/'
                                                            : '/';
                                                        console.log('Mobile fallback redirect to:', fallbackUrl);
                                                        window.location.href = fallbackUrl;
                                                    }
                                                }}
                                                className="w-full flex items-center text-left px-5 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 text-sm font-medium group"
                                            >
                                                <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                                                    <FaUserCircle className="w-4 h-4 text-red-500 group-hover:text-red-700 transition-colors duration-200" />
                                                </div>
                                                Logout
                                            </button>
                                        ) : (
                                            <Link
                                                onClick={() => setAccount(false)}
                                                href="/authentication/login"
                                                className="flex items-center px-5 py-3 text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 text-sm font-medium group"
                                            >
                                                <div className="w-8 h-8 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                                                    <FaUserCircle className="w-4 h-4 text-indigo-500 group-hover:text-indigo-700 transition-colors duration-200" />
                                                </div>
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
            </div>

            {/* Spacer for Mobile */}
            <div className="md:hidden h-28"></div>
        </nav>
    );
}

export default Navbar;
