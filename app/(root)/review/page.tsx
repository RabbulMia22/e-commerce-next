"use client";

import React, { Suspense, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ImageIcon, Star } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface ReviewFormData {
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: File[];
}

function ReviewPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReviewFormData>({
    defaultValues: {
      userName: session?.user?.name ?? "",
      rating: 0,
      title: "",
      comment: "",
      images: [],
    },
  });

  const onSubmit: SubmitHandler<ReviewFormData> = async (formValues) => {
    if (status !== "authenticated" || !session?.user?.email) {
      setFormError("Please login to submit a review.");
      router.push("/authentication/login");
      return;
    }

    if (!productId) {
      setFormError("Product ID is required. Please select a product first.");
      return;
    }

    if (rating === 0) {
      setFormError("Please select a star rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const hasImages = selectedImages.length > 0;
      let response: Response;

      if (hasImages) {
        const multipart = new FormData();
        multipart.append("productId", productId);
        multipart.append("rating", rating.toString());
        multipart.append("title", formValues.title.trim());
        multipart.append("comment", formValues.comment.trim());
        selectedImages.forEach((image) => multipart.append("images", image));

        response = await fetch("/api/reviews", {
          method: "POST",
          body: multipart,
          credentials: "include",
        });
      } else {
        const payload = {
          productId,
          rating,
          title: formValues.title.trim(),
          comment: formValues.comment.trim(),
        };

        response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      }

      if (response.status === 401) {
        setFormError("Authentication failed. Please login again.");
        router.push("/authentication/login");
        return;
      }

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setFormSuccess("Review submitted successfully!");
        reset();
        setRating(0);
        setValue("rating", 0);
        setImagePreviews([]);
        setSelectedImages([]);
        router.push(`/product/${productId}`);
      } else {
        const message = result?.error || "Failed to submit review. Please try again.";
        setFormError(message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to submit review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (selectedImages.length + files.length > 10) {
      setFormError("Maximum 10 images allowed.");
      return;
    }

    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const result = readerEvent.target?.result;
        if (typeof result === "string") {
          newPreviews.push(result);
          if (newPreviews.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    const updatedImages = [...selectedImages, ...files];
    setSelectedImages(updatedImages);
    setValue("images", updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, idx) => idx !== index);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== index);

    setSelectedImages(updatedImages);
    setImagePreviews(updatedPreviews);
    setValue("images", updatedImages);
  };

  const renderStars = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <Star
            key={star}
            className={`w-8 h-8 cursor-pointer transition-colors ${
              filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => {
              setRating(star);
              setValue("rating", star);
            }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        );
      })}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}
      </span>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold text-black">Authentication Required</h1>
        <p className="mb-4 text-center text-gray-600">Please login to post a review.</p>
        <button
          onClick={() => router.push("/authentication/login")}
          className="w-full rounded-md bg-blue-600 py-2 px-4 text-white transition-colors hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-black">Post Product Review</h1>

      {formError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
          {formSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="userName" className="mb-2 block text-sm font-medium text-black">
            User Name
          </label>
          <input
            id="userName"
            type="text"
            placeholder="Enter your name"
            {...register("userName", {
              required: "User name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
            })}
            className="w-full rounded-md border border-gray-300 p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">Rating (Click stars to rate)</label>
          <input
            {...register("rating", {
              required: "Please select a rating",
              min: { value: 1, message: "Please select at least 1 star" },
            })}
            type="hidden"
          />
          {renderStars()}
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
        </div>

        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-black">
            Review Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Great product!"
            {...register("title", {
              required: "Title is required",
              minLength: { value: 3, message: "Title must be at least 3 characters" },
            })}
            className="w-full rounded-md border border-gray-300 p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="comment" className="mb-2 block text-sm font-medium text-black">
            Your Review Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            placeholder="Share your thoughts about the product..."
            {...register("comment", {
              required: "Review comment is required",
              minLength: { value: 10, message: "Comment must be at least 10 characters" },
            })}
            className="w-full resize-none rounded-md border border-gray-300 p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Product Images (Optional - Max 10 images)
          </label>
          <div className="rounded-md border-2 border-dashed border-gray-300 p-4 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center text-black">
              <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
              <span className="text-sm">Click to upload product images</span>
              <span className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF up to 5MB each</span>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative h-20">
                  <Image src={src} alt={`Preview ${idx + 1}`} fill className="rounded border object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">{selectedImages.length}/10 images selected</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-3 px-4 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Submitting Review...
            </>
          ) : (
            "Post Review"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}