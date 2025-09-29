'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
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
  FiCheck
} from 'react-icons/fi';
import DragDropUpload from '@/components/DragDropUpload';

interface IBanner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IBannerForm {
  title: string;
  offerDescription: string;
  discount?: string;
  isActive: boolean;
}

function BannerOffersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<IBanner | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IBannerForm>({
    defaultValues: {
      isActive: true
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
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('linkUrl', data.offerDescription); // Using offerDescription as linkUrl for now
      formData.append('isActive', data.isActive.toString());
      
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
      formData.append('linkUrl', data.offerDescription); // Using offerDescription as linkUrl for now
      formData.append('isActive', data.isActive.toString());
      
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
    setValue('offerDescription', banner.linkUrl); // Using linkUrl as offerDescription for now
    setValue('isActive', banner.isActive);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-gray-600 mt-2">Create and manage promotional banners for your store</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-6 py-3  bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiImage className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Banners</p>
              <p className="text-2xl font-bold text-gray-900">{bannersData?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Offers</p>
              <p className="text-2xl font-bold text-green-600">
                {bannersData?.filter(b => b.isActive).length || 0}
              </p>
              <p className="text-xs text-gray-500">Visible to users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiEyeOff className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hidden Offers</p>
              <p className="text-2xl font-bold text-red-600">
                {bannersData?.filter(b => !b.isActive).length || 0}
              </p>
              <p className="text-xs text-gray-500">Draft mode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">All Banners</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading banners...</p>
          </div>
        ) : bannersData && bannersData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {bannersData.map((banner) => (
              <div key={banner._id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Banner Image */}
                <div className="relative aspect-[16/5] bg-gray-200">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      banner.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{banner.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    <FiImage className="inline w-4 h-4 mr-1" />
                    Promotional Banner Offer
                  </p>
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      banner.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {banner.isActive ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                          Live Offer - Visible to Users
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
                          Offer Hidden - Not Visible to Users
                        </>
                      )}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Banner"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`p-2 rounded-lg transition-colors ${
                          banner.isActive 
                            ? 'text-orange-600 hover:bg-orange-100' 
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={banner.isActive ? 'Hide Offer from Users' : 'Show Offer to Users'}
                      >
                        {banner.isActive ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Banner"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No banners found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first banner
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Banner Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Banner title is required',
                    minLength: { value: 2, message: 'Title must be at least 2 characters' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter banner title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Offer Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Description *
                </label>
                <textarea
                  {...register('offerDescription', { 
                    required: 'Offer description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-none"
                  placeholder="Describe the offer or promotion (e.g., 50% OFF Summer Sale, Buy 2 Get 1 Free, etc.)"
                />
                {errors.offerDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.offerDescription.message}</p>
                )}
              </div>

              {/* Discount Percentage (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (Optional)
                </label>
                <input
                  {...register('discount')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="e.g., 25%, 50%, BOGO"
                />
                <p className="text-xs text-gray-500 mt-1">This will be displayed prominently on the banner</p>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotional Banner Image *
                </label>
                <DragDropUpload
                  onFilesChange={handleImageUpload}
                  multiple={false}
                  accept="image/*"
                  maxSize={8}
                  maxFiles={1}
                  label="Upload Offer Banner"
                  description="Upload your promotional banner image. Recommended size: 1920x600px. Should contain offer details and be visually appealing."
                  files={bannerImage ? [bannerImage] : []}
                />
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="relative aspect-[16/5] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div className="ml-3">
                    <label className="text-sm font-semibold text-gray-900">
                      🎯 Make Offer Live for Users
                    </label>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-green-700 flex items-center">
                        <FiCheck className="w-3 h-3 mr-1" />
                        <strong>Checked (ON):</strong> Offer will be visible to all website visitors
                      </p>
                      <p className="text-xs text-red-700 flex items-center">
                        <FiX className="w-3 h-3 mr-1" />
                        <strong>Unchecked (OFF):</strong> Offer will be hidden from users (draft mode)
                      </p>
                      <p className="text-xs text-gray-600 mt-2 font-medium">
                        💡 Use this to control when your promotional offers are shown to customers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingBanner 
                      ? 'Update Banner' 
                      : 'Create Banner'
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

