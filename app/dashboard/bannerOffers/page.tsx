'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FiImage, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiMonitor,
  FiZap,
  FiStar,
  FiUsers,
  FiExternalLink,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiBarChart
} from 'react-icons/fi';

// Import components
import BannerModal from '@/components/BannerModal';

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

interface IBannerForm {
  title: string;
  offerDescription: string;
  discount?: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

function BannerOffersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<IBanner | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'current'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch banners
  const { data: bannersData, isLoading, refetch } = useQuery({
    queryKey: ['banners', filterStatus],
    queryFn: async () => {
      let url = '/api/banner';
      const params = new URLSearchParams();
      
      if (filterStatus === 'active') params.append('active', 'true');
      if (filterStatus === 'current') params.append('current', 'true');
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      return response.data.data as IBanner[];
    }
  });

  // Filter banners based on search term
  const filteredBanners = bannersData?.filter(banner => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      banner.title.toLowerCase().includes(searchLower) ||
      banner.linkUrl.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Create banner mutation
  const createMutation = useMutation({
    mutationFn: async (data: IBannerForm) => {
      console.log('[CreateMutation] Starting with data:', data);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('linkUrl', data.offerDescription);
      formData.append('isActive', data.isActive.toString());
      
      if (data.startDate) {
        formData.append('startDate', data.startDate.toISOString());
      }
      if (data.endDate) {
        formData.append('endDate', data.endDate.toISOString());
      }
      if (data.discount !== undefined && data.discount !== null && !isNaN(data.discount)) {
        formData.append('discount', data.discount.toString());
      }
      if (bannerImage) {
        formData.append('image', bannerImage);
      }

      return axios.post('/api/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleCloseModal();
      // Success notification can be added here
    },
    onError: (error: any) => {
      console.error('Error creating banner:', error);
      // Error notification can be added here
    }
  });

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: async (data: IBannerForm) => {
      const formData = new FormData();
      formData.append('id', editingBanner!._id);
      formData.append('title', data.title);
      formData.append('linkUrl', data.offerDescription);
      formData.append('isActive', data.isActive.toString());
      
      if (data.startDate) {
        formData.append('startDate', data.startDate.toISOString());
      }
      if (data.endDate) {
        formData.append('endDate', data.endDate.toISOString());
      }
      if (data.discount !== undefined && data.discount !== null && !isNaN(data.discount)) {
        formData.append('discount', data.discount.toString());
      }
      if (bannerImage) {
        formData.append('image', bannerImage);
      }

      return axios.put('/api/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      console.error('Error updating banner:', error);
    }
  });

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      return axios.delete(`/api/banner?id=${bannerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => {
      console.error('Error deleting banner:', error);
    }
  });

  // Toggle banner status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ bannerId, isActive }: { bannerId: string; isActive: boolean }) => {
      const formData = new FormData();
      formData.append('id', bannerId);
      formData.append('isActive', isActive.toString());

      return axios.put('/api/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    }
  });

  const handleEdit = (banner: IBanner) => {
    setEditingBanner(banner);
    setPreviewUrl(banner.imageUrl);
    setIsModalOpen(true);
  };

  const handleDelete = (bannerId: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(bannerId);
    }
  };

  const handleToggleStatus = (banner: IBanner) => {
    toggleStatusMutation.mutate({
      bannerId: banner._id,
      isActive: !banner.isActive
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setBannerImage(null);
    setPreviewUrl('');
  };

  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setBannerImage(files[0]);
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setBannerImage(null);
      setPreviewUrl('');
    }
  };

  const handleFormSubmit = (data: IBannerForm) => {
    if (!bannerImage && !editingBanner) {
      alert('Please select a banner image');
      return;
    }

    if (editingBanner) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const activeBanners = bannersData?.filter(b => b.isActive).length || 0;
  const totalBanners = bannersData?.length || 0;
  const inactiveBanners = totalBanners - activeBanners;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8">
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
              <button 
                onClick={() => refetch()}
                className="flex items-center px-6 py-3 text-gray-600 bg-white/70 backdrop-blur-md hover:bg-white border border-gray-200/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <FiRefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Refresh
              </button>
              <button className="flex items-center px-6 py-3 text-gray-600 bg-white/70 backdrop-blur-md hover:bg-white border border-gray-200/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group">
                <FiBarChart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Analytics
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-semibold transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FiPlus className="relative w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative">Create Banner</span>
                <div className="relative ml-3 px-3 py-1 bg-white/20 rounded-xl text-xs font-bold">
                  ✨ NEW
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Inactive Banners */}
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

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filter by:</span>
              
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All Banners', color: 'gray' },
                  { key: 'active', label: 'Active', color: 'green' },
                  { key: 'inactive', label: 'Inactive', color: 'orange' },
                  { key: 'current', label: 'Live Now', color: 'blue' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterStatus(filter.key as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      filterStatus === filter.key
                        ? `bg-${filter.color}-100 text-${filter.color}-700 border border-${filter.color}-200`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Banner Gallery Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <FiImage className="w-4 h-4 text-white" />
                  </div>
                  Campaign Gallery
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredBanners.length} banner{filteredBanners.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium">
                  {filteredBanners.length} Results
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Campaigns</h3>
              <p className="text-gray-600">Fetching your banner collection...</p>
            </div>
          ) : filteredBanners.length > 0 ? (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBanners.map((banner, index) => (
                  <div
                    key={banner._id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Banner Image */}
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md font-semibold text-xs ${banner.isActive
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
                            onClick={() => handleEdit(banner)}
                            className="p-3 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-colors shadow-lg"
                            title="Edit Banner"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(banner)}
                            className="p-3 bg-white/90 text-gray-900 rounded-full hover:bg-white transition-colors shadow-lg"
                            title={banner.isActive ? 'Hide Banner' : 'Show Banner'}
                          >
                            {banner.isActive ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <FiImage className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'No Banners Found' : 'No Campaigns Yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No banners match "${searchTerm}". Try a different search term.`
                  : 'Start creating beautiful banner campaigns to engage your customers and boost conversions.'
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Modal */}
      <BannerModal
        isOpen={isModalOpen}
        editingBanner={editingBanner}
        bannerImage={bannerImage}
        previewUrl={previewUrl}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        onImageUpload={handleImageUpload}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

export default BannerOffersPage;