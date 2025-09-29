"use client";
import React, { useState } from 'react';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo */}
                    <div className="flex-shrink-0 text-2xl font-bold text-indigo-600">
                        ShopMate
                    </div>

                    <div className="hidden md:flex space-x-6 items-center">
                        <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Home</a>
                        <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Shop</a>
                        <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Categories</a>
                        <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">About</a>
                        <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Contact</a>

                        <input
                            type="text"
                            placeholder="Search products..."
                            className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <div className="relative cursor-pointer text-gray-700 hover:text-indigo-600">
                            <FaShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">3</span>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-6">
                        <div className="relative cursor-pointer text-gray-700 hover:text-indigo-600">
                            <FaShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">3</span>
                        </div>
                        <button onClick={toggleMenu}>
                            {isOpen ? <FaTimes size={24} className='text-gray-700 hover:text-indigo-600' /> : <FaBars size={24} className='text-gray-700 hover:text-indigo-600' />}
                        </button>
                        
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`md:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between items-center px-4 py-4 border-b">
                    <div className="text-2xl font-bold text-indigo-600">ShopMate</div>
                    <button onClick={toggleMenu}><FaTimes size={24} className='text-gray-700 hover:text-indigo-600' /></button>
                </div>

                <div className="flex flex-col px-4 py-6 space-y-4">
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Home</a>
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Shop</a>
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Categories</a>
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">About</a>
                    <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Contact</a>

                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />


                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-40"
                    onClick={toggleMenu}
                ></div>
            )}
        </nav>
    );
}

export default Navbar;
