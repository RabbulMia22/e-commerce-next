'use client';

import React from 'react';
import { FiImage, FiEye, FiEyeOff, FiTrendingUp, FiUsers, FiStar } from 'react-icons/fi';

interface StatsCardsProps {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
}

function StatsCards({ totalBanners, activeBanners, inactiveBanners }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Total Banners */}
      <div className="group relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</p>
            <p className="text-3xl font-bold text-gray-900">{totalBanners}</p>
            <div className="text-xs text-blue-600 font-medium mt-2 flex items-center">
              <FiTrendingUp className="w-3 h-3 mr-1" />
              All banners created
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FiImage className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Active Banners */}
      <div className="group relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Live Campaigns</p>
            <p className="text-3xl font-bold text-green-600">{activeBanners}</p>
            <div className="text-xs text-green-600 font-medium mt-2 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Engaging customers
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FiEye className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Hidden Banners */}
      <div className="group relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Draft Campaigns</p>
            <p className="text-3xl font-bold text-orange-600">{inactiveBanners}</p>
            <div className="text-xs text-orange-600 font-medium mt-2 flex items-center">
              <FiEyeOff className="w-3 h-3 mr-1" />
              Preparing to launch
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FiEyeOff className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="group relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {totalBanners > 0 ? Math.round((activeBanners / totalBanners) * 100) : 0}%
            </p>
            <div className="text-xs text-purple-600 font-medium mt-2 flex items-center">
              <FiStar className="w-3 h-3 mr-1" />
              Campaign effectiveness
            </div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FiUsers className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;