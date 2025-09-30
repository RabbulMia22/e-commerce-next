'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiExternalLink,
  FiImage,
  FiSave,
  FiX,
  FiCheck,
  FiTrendingUp,
  FiUsers,
  FiStar,
  FiActivity,
  FiMonitor,
  FiZap,
  FiCalendar
} from 'react-icons/fi';
import DragDropUpload from '@/components/DragDropUpload';

interface IBanner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  discount?: number;
  startDate: Date;
  endDate: Date;
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

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<IBannerForm>({
    defaultValues: {
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });

  // Fetch banners
  const { data: bannersData, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await axios.get('/api/banner');
      return response.data.data as IBanner[];
    }
  });

  // Create banner mutation
  const createMutation = useMutation({
    mutationFn: async (data: IBannerForm) => {
      console.log('[Frontend] Form data received:', data);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('linkUrl', data.offerDescription); 
      formData.append('isActive', data.isActive.toString());
      
      // Add date fields
      if (data.startDate) {
        formData.append('startDate', data.startDate.toISOString());
      }
      if (data.endDate) {
        formData.append('endDate', data.endDate.toISOString());
      }
      
      // Add discount field if provided
      console.log('[Frontend] Discount check:', data.discount, typeof data.discount);
      if (data.discount !== undefined && data.discount !== null && !isNaN(data.discount)) {
        formData.append('discount', data.discount.toString());
        console.log('[Frontend] Added discount to formData:', data.discount.toString());
      } else {
        console.log('[Frontend] Discount not added - value was:', data.discount);
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
      alert('Banner created successfully!');
    },
    onError: (error: any) => {
      alert('Error creating banner: ' + (error.response?.data?.error || error.message));
    }
  });

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: async (data: IBannerForm) => {
      console.log('[Frontend Update] Form data received:', data);
      
      const formData = new FormData();
      formData.append('id', editingBanner!._id);
      formData.append('title', data.title);
      formData.append('linkUrl', data.offerDescription);
      formData.append('isActive', data.isActive.toString());
      
      // Add date fields
      if (data.startDate) {
        formData.append('startDate', data.startDate.toISOString());
      }
      if (data.endDate) {
        formData.append('endDate', data.endDate.toISOString());
      }
      
      // Add discount field if provided
      console.log('[Frontend Update] Discount check:', data.discount, typeof data.discount);
      if (data.discount !== undefined && data.discount !== null && !isNaN(data.discount)) {
        formData.append('discount', data.discount.toString());
        console.log('[Frontend Update] Added discount to formData:', data.discount.toString());
      } else {
        console.log('[Frontend Update] Discount not added - value was:', data.discount);
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
      alert('Banner updated successfully!');
    },
    onError: (error: any) => {
      alert('Error updating banner: ' + (error.response?.data?.error || error.message));
    }
  });

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      return axios.delete(`/api/banner?id=${bannerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      alert('Banner deleted successfully!');
    },
    onError: (error: any) => {
      alert('Error deleting banner: ' + (error.response?.data?.error || error.message));
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

  const onSubmit: SubmitHandler<IBannerForm> = (data) => {
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

  const handleEdit = (banner: IBanner) => {
    setEditingBanner(banner);
    setValue('title', banner.title);
    setValue('offerDescription', banner.linkUrl);
    setValue('discount', banner.discount || undefined);
    setValue('isActive', banner.isActive);
    setValue('startDate', banner.startDate ? new Date(banner.startDate) : new Date());
    setValue('endDate', banner.endDate ? new Date(banner.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
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
    reset();
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

      <div className="relative z-10 p-6">
        {/* Enhanced Header */}
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
                onClick={() => setIsModalOpen(true)}
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

        {/* Enhanced Stats Cards */}
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

          {/* Engagement Rate */}
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

        {/* Enhanced Banners Section */}
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
                <p className="text-gray-600 mt-1">Manage your promotional banners and track their performance</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium">
                  {totalBanners} Total Campaigns
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
          ) : bannersData && bannersData.length > 0 ? (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bannersData.map((banner, index) => (
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
          ) : (
            <div className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <FiImage className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Campaigns Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start creating beautiful banner campaigns to engage your customers and boost conversions.
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

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <FiImage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingBanner ? 'Edit Campaign' : 'Create New Campaign'}
                    </h2>
                    <p className="text-gray-600">
                      {editingBanner ? 'Update your banner details' : 'Design a stunning promotional banner'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              {/* Banner Title */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Campaign Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Campaign title is required',
                    minLength: { value: 2, message: 'Title must be at least 2 characters' }
                  })}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                  placeholder="e.g., Summer Flash Sale 2024"
                />
                {errors.title && (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                    <FiX className="w-4 h-4" />
                    {errors.title.message}
                  </div>
                )}
              </div>

              {/* Offer Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Campaign URL / Link *
                </label>
                <textarea
                  {...register('offerDescription', { 
                    required: 'Campaign URL is required',
                    minLength: { value: 10, message: 'URL must be at least 10 characters' }
                  })}
                  rows={3}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 bg-gray-50 focus:bg-white resize-none"
                  placeholder="https://yourstore.com/summer-sale or describe your offer"
                />
                {errors.offerDescription && (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                    <FiX className="w-4 h-4" />
                    {errors.offerDescription.message}
                  </div>
                )}
              </div>

              {/* Discount Percentage */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Discount Percentage (Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register('discount', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Discount cannot be negative' },
                      max: { value: 100, message: 'Discount cannot exceed 100%' }
                    })}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 bg-gray-50 focus:bg-white pr-12"
                    placeholder="25"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    %
                  </div>
                </div>
                {errors.discount && (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                    <FiX className="w-4 h-4" />
                    {errors.discount.message}
                  </div>
                )}
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <FiZap className="w-3 h-3" />
                  This will show as a discount badge on your banner (e.g., "25% OFF")
                </div>
              </div>

              {/* Campaign Duration */}
              <div className="space-y-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Campaign Duration</h3>
                    <p className="text-sm text-gray-600">Set when your campaign should be active</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Campaign Start Date *
                    </label>
                    <Controller
                      name="startDate"
                      control={control}
                      rules={{ required: 'Start date is required' }}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                          placeholderText="Select start date and time"
                          minDate={new Date()}
                          wrapperClassName="w-full"
                        />
                      )}
                    />
                    {errors.startDate && (
                      <div className="text-red-500 text-sm flex items-center gap-2">
                        <FiX className="w-4 h-4" />
                        {errors.startDate.message}
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Campaign End Date *
                    </label>
                    <Controller
                      name="endDate"
                      control={control}
                      rules={{ 
                        required: 'End date is required',
                        validate: (value, formValues) => {
                          if (formValues.startDate && value && new Date(value) <= new Date(formValues.startDate)) {
                            return 'End date must be after start date';
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 bg-gray-50 focus:bg-white"
                          placeholderText="Select end date and time"
                          minDate={new Date()}
                          wrapperClassName="w-full"
                        />
                      )}
                    />
                    {errors.endDate && (
                      <div className="text-red-500 text-sm flex items-center gap-2">
                        <FiX className="w-4 h-4" />
                        {errors.endDate.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-indigo-700 bg-indigo-100 p-3 rounded-xl flex items-start gap-2">
                  <FiCalendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Campaign Scheduling Tips:</p>
                    <ul className="space-y-1">
                      <li>• Campaigns automatically activate and deactivate based on these dates</li>
                      <li>• Choose peak hours for maximum visibility (e.g., 9 AM - 9 PM)</li>
                      <li>• Consider your audience's time zone when setting dates</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Campaign Banner Image *
                </label>
                <DragDropUpload
                  onFilesChange={handleImageUpload}
                  multiple={false}
                  accept="image/*"
                  maxSize={8}
                  maxFiles={1}
                  label="Upload Campaign Banner"
                  description="Upload your promotional banner image. Recommended: 1920x600px for best results."
                  files={bannerImage ? [bannerImage] : []}
                />
                
                {/* Enhanced Image Preview */}
                {previewUrl && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Preview:</p>
                    <div className="relative aspect-[16/6] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={previewUrl}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Status */}
              <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 mt-1"
                  />
                  <div className="space-y-3">
                    <label className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      🚀 Launch Campaign Immediately
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-800">Live Campaign</p>
                          <p className="text-green-700">Visible to all website visitors</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <FiX className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Draft Mode</p>
                          <p className="text-gray-700">Hidden from users (preview only)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <FiSave className="w-5 h-5" />
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving Campaign...' 
                    : editingBanner 
                      ? 'Update Campaign' 
                      : 'Launch Campaign'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerOffersPage;