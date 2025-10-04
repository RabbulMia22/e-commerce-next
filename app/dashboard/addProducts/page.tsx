"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DragDropUpload from "@/components/DragDropUpload";

interface IFormInputs {
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  stock: number;
  hasSize: boolean;
  availableSizes: string[];
}

export default function AddProductPage() {
  const queryClient = useQueryClient();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [hasSize, setHasSize] = useState<boolean>(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IFormInputs>({
    defaultValues: {
      stock: 0,
      hasSize: false,
      availableSizes: []
    },
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: async (data: IFormInputs) => {
      const formData = new FormData();
      
      // Append form fields (excluding arrays which need special handling)
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'availableSizes') {
          // Handle array field separately
          return;
        }
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add size fields
      formData.append('hasSize', hasSize.toString());
      if (hasSize && availableSizes.length > 0) {
        formData.append('availableSizes', JSON.stringify(availableSizes));
      }

      // Append thumbnail file
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
        console.log('Thumbnail added:', thumbnailFile.name);
      }
      
      // FIXED: Append additional images with indexed names AND array approach
      if (imageFiles.length > 0) {
        // Method 1: Array approach (most common)
        imageFiles.forEach((file, index) => {
          formData.append('images', file);
          console.log(`Adding image ${index + 1}:`, file.name);
        });

        // Method 2: Also add with indexed names as backup
        imageFiles.forEach((file, index) => {
          formData.append(`image_${index}`, file);
        });

        // Add total count
        formData.append('imageCount', imageFiles.length.toString());
      }

      // Debug: Log ALL form data contents
      console.log('\n=== FORM DATA CONTENTS ===');
      console.log('Total entries:', Array.from(formData.entries()).length);
      
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=========================\n');

      return axios.post("/api/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (response) => {
      console.log('Success response:', response.data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      setThumbnailFile(null);
      setImageFiles([]);
      alert("Product added successfully!");
    },
    onError: (error: any) => {
      console.error('Error details:', error.response?.data || error.message);
      alert("Error adding product: " + (error.response?.data?.error || error.message));
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    console.log('\n=== FORM SUBMISSION ===');
    console.log('Form data:', data);
    console.log('Has size:', hasSize);
    console.log('Available sizes:', availableSizes);
    console.log('Thumbnail file:', thumbnailFile?.name || 'None');
    console.log('Additional images count:', imageFiles.length);
    console.log('Additional images:', imageFiles.map(f => f.name));
    console.log('=====================\n');

    // Validation
    if (!thumbnailFile) {
      alert('Please upload a main product image');
      return;
    }

    if (hasSize && availableSizes.length === 0) {
      alert('Please add at least one size for this product');
      return;
    }

    const formData = {
      ...data,
      hasSize,
      availableSizes
    };

    mutation.mutate(formData);
  };

  // Size management functions
  const addSize = () => {
    if (customSize.trim() && !availableSizes.includes(customSize.trim())) {
      setAvailableSizes([...availableSizes, customSize.trim()]);
      setCustomSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setAvailableSizes(availableSizes.filter(size => size !== sizeToRemove));
  };

  const addPredefinedSize = (size: string) => {
    if (!availableSizes.includes(size)) {
      setAvailableSizes([...availableSizes, size]);
    }
  };

  // Reset function to clear all form data
  const resetForm = () => {
    reset();
    setThumbnailFile(null);
    setImageFiles([]);
    setHasSize(false);
    setAvailableSizes([]);
    setCustomSize('');
  };

  const handleThumbnailChange = (files: File[]) => {
    console.log('Thumbnail files received:', files.length);
    if (files.length > 0) {
      setThumbnailFile(files[0]);
      console.log('Thumbnail set:', files[0].name);
    } else {
      setThumbnailFile(null);
    }
  };

  const handleImagesChange = (files: File[]) => {
    console.log('Additional images received:', files.length);
    setImageFiles(files);
    files.forEach((file, index) => {
      console.log(`Image ${index + 1}:`, file.name);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Form
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title *</label>
                <input
                  {...register("title", { 
                    required: "Product title is required",
                    minLength: { value: 2, message: "Title must be at least 2 characters" }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <input
                  {...register("category", { 
                    required: "Category is required" 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                  placeholder="Product category (e.g., Electronics, Clothing)"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                {...register("description", { 
                  required: "Description is required",
                  minLength: { value: 10, message: "Description must be at least 10 characters" }
                })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 resize-none"
                placeholder="Enter detailed product description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (BDT) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">৳</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", { 
                      required: "Price is required",
                      min: { value: 0.01, message: "Price must be greater than 0" },
                      valueAsNumber: true
                    })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  {...register("stock", { 
                    required: "Stock quantity is required",
                    min: { value: 0, message: "Stock cannot be negative" },
                    valueAsNumber: true
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter stock quantity"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                <input
                  {...register("brand")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                  placeholder="Brand name (optional)"
                />
              </div>
            </div>

            {/* Size Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="hasSize"
                  checked={hasSize}
                  onChange={(e) => {
                    setHasSize(e.target.checked);
                    if (!e.target.checked) {
                      setAvailableSizes([]);
                      setCustomSize('');
                    }
                  }}
                  className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasSize" className="text-sm font-semibold text-gray-700 cursor-pointer flex-1">
                  This product has sizes (clothing, shoes, etc.)
                </label>
              </div>

              {hasSize && (
                <div className="space-y-4 bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Size Selection</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => addPredefinedSize(size)}
                          disabled={availableSizes.includes(size)}
                          className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all ${
                            availableSizes.includes(size)
                              ? 'bg-green-500 text-white border-green-500 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {size} {availableSizes.includes(size) && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Add Custom Size</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="Enter custom size (e.g., 30, 32, UK 8, EU 42)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={addSize}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
                      >
                        Add Size
                      </button>
                    </div>
                  </div>

                  {availableSizes.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Selected Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <span
                            key={size}
                            className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => removeSize(size)}
                              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900">Product Images *</h3>
                <p className="text-sm text-gray-600">Upload high-quality images for your product</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Main Product Image
                    {thumbnailFile && (
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                        ✓ Selected
                      </span>
                    )}
                  </h4>
                  <DragDropUpload
                    onFilesChange={handleThumbnailChange}
                    multiple={false}
                    accept="image/*"
                    maxSize={8}
                    maxFiles={1}
                    label="Upload Thumbnail"
                    description="Drag and drop your main product image here, or click to select (Max 8MB)"
                    files={thumbnailFile ? [thumbnailFile] : []}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Additional Images ({imageFiles.length}/10)
                    {imageFiles.length > 0 && (
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                        ✓ {imageFiles.length} selected
                      </span>
                    )}
                  </h4>
                  <DragDropUpload
                    onFilesChange={handleImagesChange}
                    multiple={true}
                    accept="image/*"
                    maxSize={8}
                    maxFiles={10}
                    label="Upload Additional Images"
                    description="Drag and drop additional product images here, or click to select multiple files (up to 10, Max 8MB each)"
                    files={imageFiles}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors"
                  />
                  
                  {/* Display selected additional images */}
                  {imageFiles.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-3">Selected Images ({imageFiles.length}):</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                            <span className="text-sm text-gray-700 truncate flex-1">{index + 1}. {file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Total size: {(imageFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={mutation.isPending || !thumbnailFile}
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Product...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </form>

          {/* Debug Info - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Thumbnail:</strong> {thumbnailFile?.name || 'None'}</p>
                <p><strong>Additional Images:</strong> {imageFiles.length} files</p>
                <p><strong>Ready to submit:</strong> {thumbnailFile ? '✅' : '❌'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}