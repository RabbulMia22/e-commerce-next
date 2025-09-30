'use client';

import React from 'react';
import { FiImage, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiExternalLink, FiCalendar } from 'react-icons/fi';

interface IBanner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  discount?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannerGridProps {
  banners: IBanner[];
  onEdit: (banner: IBanner) => void;
  onDelete: (bannerId: string) => void;
  onToggleStatus: (banner: IBanner) => void;
  onCreate: () => void;
}

function BannerGrid({ banners, onEdit, onDelete, onToggleStatus, onCreate }: BannerGridProps) {
  if (banners.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
          <FiImage className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Campaigns Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start creating beautiful banner campaigns to engage your customers and boost conversions.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FiImage className="w-5 h-5 mr-2" />
          Create Your First Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {banners.map((banner, index) => (
          <div 
            key={banner._id} 
            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Banner Image */}
            <div className="relative aspect-[16/7] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md font-semibold text-xs ${
                  banner.isActive 
                    ? 'bg-green-500/90 text-white shadow-green-500/25' 
                    : 'bg-gray-800/90 text-white shadow-gray-800/25'
                } shadow-lg`}>
                  {banner.isActive ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      DRAFT
                    </>
                  )}
                </div>
              </div>

              {/* Discount Badge */}
              {banner.discount && (
                <div className="absolute top-4 left-4">
                  <div className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                    -{banner.discount}% OFF
                  </div>
                </div>
              )}

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(banner)}
                    className="p-3 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-colors shadow-lg"
                    title="Edit Banner"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(banner)}
                    className="p-3 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-colors shadow-lg"
                    title={banner.isActive ? 'Hide Banner' : 'Show Banner'}
                  >
                    {banner.isActive ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => onDelete(banner._id)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete Banner"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Banner Info */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {banner.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {banner.linkUrl}
                </p>
              </div>

              {/* Campaign Status */}
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                banner.isActive 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  banner.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-semibold ${
                  banner.isActive ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {banner.isActive ? 'Campaign Active - Engaging Customers' : 'Draft Mode - Ready to Launch'}
                </span>
              </div>

              {/* Campaign Dates */}
              {(banner.startDate || banner.endDate) && (
                <div className="space-y-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <FiCalendar className="w-3 h-3" />
                    <span className="text-xs font-semibold">Campaign Schedule</span>
                  </div>
                  {banner.startDate && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Start:</span> {new Date(banner.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {banner.endDate && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">End:</span> {new Date(banner.endDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Created {new Date(banner.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <FiExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">View Details</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BannerGrid;