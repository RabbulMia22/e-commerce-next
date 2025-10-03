"use client";
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Star, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

interface ReviewFormData {
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: File[];
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

function ReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ReviewFormData>({
    defaultValues: {
      userName: session?.user?.name || '',
      rating: 0,
      title: '',
      comment: '',
      images: [],
    },
  });

  // Cloudinary upload function
  const uploadImagesToCloudinary = async (images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'your_upload_preset'); // Replace with your Cloudinary preset
      
      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, // Replace with your Cloudinary cloud name
          formData
        );
        uploadedUrls.push(response.data.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };

  const onSubmit: SubmitHandler<ReviewFormData> = async (data) => {
    // Debug session information
      console.log('=== AUTHENTICATION DEBUG ===');
      console.log('Session status:', status);
      console.log('Session data:', session);
      console.log('User email:', session?.user?.email);
      console.log('Product ID:', productId);

      // Check if user is authenticated
      if (status !== 'authenticated' || !session?.user?.email) {
        alert('Please login to submit a review');
        router.push('/authentication/login');
        return;
      }

      // Test API endpoint before submitting review
      try {
        console.log('Testing authentication with API...');
        const testResponse = await apiClient.get('/api/auth/session');
        console.log('Auth test response:', testResponse.data);
      } catch (authError) {
        console.error('Authentication test failed:', authError);
      }    // Check if productId exists
    if (!productId) {
      alert('Product ID is required. Please select a product first.');
      return;
    }

    // Check if rating is selected
    if (rating === 0) {
      alert('Please select a star rating before submitting.');
      return;
    }

    console.log('✅ All validation checks passed');

    try {
      setIsSubmitting(true);
      setUploadingImages(true);

      // Images will be uploaded by the backend middleware
      setUploadingImages(false);

      // Prepare review data - use FormData if images are included
      let reviewPayload: FormData | any;
      
      if (selectedImages.length > 0) {
        // Use FormData for requests with images
        console.log(`📸 Preparing FormData with ${selectedImages.length} images`);
        console.log('📋 Form data values:');
        console.log('  - productId:', productId);
        console.log('  - rating:', rating);
        console.log('  - title:', data.title.trim());
        console.log('  - comment:', data.comment.trim());
        
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('rating', rating.toString());
        formData.append('title', data.title.trim());
        formData.append('comment', data.comment.trim());
        
        // Add all image files
        selectedImages.forEach((image, index) => {
          formData.append('images', image);
          console.log(`Adding image ${index + 1}: ${image.name}`);
        });
        
        reviewPayload = formData;
      } else {
        // Use JSON for requests without images
        console.log('📝 Preparing JSON data (no images)');
        console.log('📋 JSON data values:');
        console.log('  - productId:', productId);
        console.log('  - rating:', rating);
        console.log('  - title:', data.title.trim());
        console.log('  - comment:', data.comment.trim());
        
        reviewPayload = {
          productId,
          rating,
          title: data.title.trim(),
          comment: data.comment.trim(),
        };
      }

      console.log('Review payload type:', selectedImages.length > 0 ? 'FormData' : 'JSON');

      // Submit review to backend API with session token
      const config = selectedImages.length > 0 ? {
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        withCredentials: true
      } : {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      console.log('🚀 Sending request with config:', config);
      const response = await axios.post('/api/reviews', reviewPayload, config);

      if (response.data.success) {
        alert('Review submitted successfully!');
        
        // Reset form
        reset();
        setRating(0);
        setImagePreviews([]);
        setSelectedImages([]);
        
        // Redirect to product page or reviews page
        router.push(`/product/${productId}`);
      } else {
        alert(response.data.error || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      console.log('Full error response:', error.response);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        router.push('/authentication/login');
      } else {
        alert(error.response?.data?.error || 'Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...files]);
    setValue('images', [...selectedImages, ...files]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    setValue('images', newImages);
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoverRating || rating);
          return (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
              }`}
              onClick={() => {
                setRating(star);
                setValue('rating', star);
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          );
        })}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
        </span>
      </div>
    );
  };

  // Check authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Authentication Required</h1>
        <p className="text-center text-gray-600 mb-4">Please login to post a review.</p>
        <button
          onClick={() => router.push('/authentication/login')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

 

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Post Product Review</h1>
      
      {/* Debug Authentication Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
        <p><strong>Auth Status:</strong> {status}</p>
        <p><strong>User:</strong> {session?.user?.name || 'Not logged in'}</p>
        <p><strong>Email:</strong> {session?.user?.email || 'No email'}</p>
        <p><strong>Product ID:</strong> {productId || 'No product ID'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* User Name Field */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-black mb-2">
            User Name
          </label>
          <input
            id="userName"
            type="text"
            placeholder="Enter your name"
            defaultValue={session?.user?.name || ''}
            {...register('userName', { 
              required: 'User name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            style={{ color: 'black' }}
          />
          {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>}
        </div>

        {/* Star Rating Field */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Rating (Click stars to rate)
          </label>
          <input
            {...register('rating', { 
              required: 'Please select a rating',
              min: { value: 1, message: 'Please select at least 1 star' }
            })}
            type="hidden"
          />
          {renderStars()}
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
        </div>

        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
            Review Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Great product!"
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' }
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            style={{ color: 'black' }}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Comment Field */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-black mb-2">
            Your Review Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            placeholder="Share your thoughts about the product..."
            {...register('comment', { 
              required: 'Review comment is required',
              minLength: { value: 10, message: 'Comment must be at least 10 characters' }
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
            style={{ color: 'black' }}
          />
          {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
        </div>

        {/* Product Images Upload */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Product Images (Optional - Max 10 images)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center text-black"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-black">Click to upload product images</span>
              <span className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF up to 5MB each</span>
            </label>
          </div>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative h-20">
                  <Image 
                    src={src} 
                    alt={`Preview ${idx + 1}`} 
                    fill 
                    className="object-cover rounded border" 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {selectedImages.length}/10 images selected
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploadingImages ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading Images...
            </>
          ) : isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting Review...
            </>
          ) : (
            'Post Review'
          )}
        </button>
      </form>
    </div>
  );
}

export default ReviewPage;