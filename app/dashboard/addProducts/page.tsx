"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface IFormInputs {
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  stock: number;
}

export default function AddProductPage() {
  const queryClient = useQueryClient();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IFormInputs>({
    defaultValues: {
      stock: 0
    },
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: async (data: IFormInputs) => {
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append files
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      return axios.post("/api/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      setThumbnailFile(null);
      setImageFiles([]);
      alert("Product added successfully!");
    },
    onError: (error: any) => {
      alert("Error adding product: " + (error.response?.data?.error || error.message));
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    mutation.mutate(data);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
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
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-black"
            placeholder="Enter product title"
          />
          <p className="text-red-500 text-sm mt-1">{errors.title?.message}</p>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-black">Description *</label>
          <textarea
            {...register("description", { 
              required: "Description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" }
            })}
            rows={4}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-black"
            placeholder="Enter detailed product description"
          />
          <p className="text-red-500 text-sm mt-1">{errors.description?.message}</p>
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
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black "
              placeholder="0.00"
            />
            <p className="text-red-500 text-sm mt-1">{errors.price?.message}</p>
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
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black "
              placeholder="0"
            />
            <p className="text-red-500 text-sm mt-1">{errors.stock?.message}</p>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-black">Category *</label>
            <input
              {...register("category", { 
                required: "Category is required" 
              })}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black "
              placeholder="Product category"
            />
            <p className="text-red-500 text-sm mt-1">{errors.category?.message}</p>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-black">Brand</label>
          <input
            {...register("brand")}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black "
            placeholder="Brand name (optional, defaults to 'Generic')"
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Product Images *</h3>
          <p className="text-sm text-gray-600">At least one image is required</p>
          
          <div>
            <label className="block font-semibold mb-2 text-black">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black "
            />
            {thumbnailFile && (
              <p className="text-green-600 text-sm mt-1 ">Selected: {thumbnailFile.name}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2 text-black">Additional Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black "
            />
            {imageFiles.length > 0 && (
              <p className="text-green-600 text-sm mt-1">
                Selected {imageFiles.length} image(s): {imageFiles.map(f => f.name).join(', ')}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
