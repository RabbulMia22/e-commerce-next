'use client';

import React from 'react';
import { FiImage, FiZap, FiActivity, FiMonitor, FiEye, FiPlus } from 'react-icons/fi';

interface PageHeaderProps {
  onCreateClick: () => void;
}

function PageHeader({ onCreateClick }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FiImage className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FiZap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Banner Studio
              </h1>
              <p className="text-lg text-gray-600 mt-1">Create stunning promotional banners that convert visitors into customers</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">System Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
              <FiActivity className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
              <FiMonitor className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 font-medium">Responsive Design</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center px-6 py-3 text-gray-600 bg-white/70 backdrop-blur-md hover:bg-white border border-gray-200/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group">
            <FiEye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Preview Live Site
          </button>
          <button
            onClick={onCreateClick}
            className="relative flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-semibold transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiPlus className="relative w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative">Create Masterpiece</span>
            <div className="relative ml-3 px-3 py-1 bg-white/20 rounded-xl text-xs font-bold">
              ✨ NEW
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;