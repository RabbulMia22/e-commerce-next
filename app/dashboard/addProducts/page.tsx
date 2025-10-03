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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-black">Add New Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div>
          <label className="block font-semibold mb-2 text-black">Product Title *</label>
          <input
            {...register("title", { 
              required: "Product title is required",
              minLength: { value: 2, message: "Title must be at least 2 characters" }
            })}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
            placeholder="Enter product title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-2 text-black">Description *</label>
          <textarea
            {...register("description", { 
              required: "Description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" }
            })}
            rows={4}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
            placeholder="Enter detailed product description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Pricing and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-black">Price *</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { 
                required: "Price is required",
                min: { value: 0.01, message: "Price must be greater than 0" },
                valueAsNumber: true
              })}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-black"
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block font-semibold mb-2 text-black">Stock Quantity *</label>
            <input
              type="number"
              {...register("stock", { 
                required: "Stock quantity is required",
                min: { value: 0, message: "Stock cannot be negative" },
                valueAsNumber: true
              })}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
              placeholder="0"
            />
            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
          </div>

          <div>
            <label className="block font-semibold mb-2 text-black">Category *</label>
            <input
              {...register("category", { 
                required: "Category is required" 
              })}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
              placeholder="Product category"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-black">Brand</label>
          <input
            {...register("brand")}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
            placeholder="Brand name (optional, defaults to 'Generic')"
          />
        </div>

        {/* Size Configuration */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
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
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasSize" className="font-semibold text-black">
              This product has sizes (clothing, shoes, etc.)
            </label>
          </div>

          {hasSize && (
            <div className="pl-8 space-y-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
              <div>
                <label className="block font-medium mb-2 text-black">Quick Size Selection</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => addPredefinedSize(size)}
                      disabled={availableSizes.includes(size)}
                      className={`px-3 py-1 text-sm rounded-lg border transition-all ${
                        availableSizes.includes(size)
                          ? 'bg-green-500 text-white border-green-500 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {size} {availableSizes.includes(size) && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-black">Add Custom Size</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="Enter custom size (e.g., 30, 32, UK 8, EU 42)"
                    className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {availableSizes.length > 0 && (
                <div>
                  <label className="block font-medium mb-2 text-black">Selected Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Images *</h3>
            <p className="text-sm text-gray-600 mb-4">Upload high-quality images for your product</p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Main Product Image
              {thumbnailFile && <span className="text-green-600 ml-2">✓ Selected: {thumbnailFile.name}</span>}
            </h4>
            <DragDropUpload
              onFilesChange={handleThumbnailChange}
              multiple={false}
              accept="image/*"
              maxSize={8}
              maxFiles={1}
              label="Upload Thumbnail"
              description="Drag and drop your main product image here, or click to select"
              files={thumbnailFile ? [thumbnailFile] : []}
              className="mb-6"
            />
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Additional Images ({imageFiles.length}/10)
              {imageFiles.length > 0 && <span className="text-green-600 ml-2">✓ {imageFiles.length} selected</span>}
            </h4>
            <DragDropUpload
              onFilesChange={handleImagesChange}
              multiple={true}
              accept="image/*"
              maxSize={8}
              maxFiles={10}
              label="Upload Additional Images"
              description="Drag and drop additional product images here, or click to select multiple files (up to 10)"
              files={imageFiles}
            />
            
            {/* Display selected additional images */}
            {imageFiles.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Images ({imageFiles.length}):</p>
                <ul className="space-y-1">
                  {imageFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 flex justify-between">
                      <span>{index + 1}. {file.name}</span>
                      <span>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Total size: {(imageFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={mutation.isPending || !thumbnailFile}
        >
          {mutation.isPending ? "Creating Product..." : "Create Product"}
        </button>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
          <strong>Debug Info:</strong><br/>
          Thumbnail: {thumbnailFile?.name || 'None'}<br/>
          Additional Images: {imageFiles.length} files<br/>
          Ready to submit: {thumbnailFile ? '✅' : '❌'}
        </div>
      </form>
    </div>
  );
}