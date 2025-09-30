'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FiImage } from 'react-icons/fi';

// Import components
import PageHeader from '@/components/PageHeader';
import StatsCards from '@/components/StatsCards';
import BannerGrid from '@/components/BannerGrid';
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
      alert('Banner created successfully!');
    },
    onError: (error: any) => {
      alert('Error creating banner: ' + (error.response?.data?.error || error.message));
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

      <div className="relative z-10 p-6">
        {/* Page Header */}
        <PageHeader onCreateClick={() => setIsModalOpen(true)} />

        {/* Stats Cards */}
        <StatsCards 
          totalBanners={totalBanners}
          activeBanners={activeBanners}
          inactiveBanners={inactiveBanners}
        />

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
          ) : (
            <BannerGrid
              banners={bannersData || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onCreate={() => setIsModalOpen(true)}
            />
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