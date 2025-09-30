'use client';

import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiImage, FiSave, FiX, FiZap, FiCalendar, FiCheck } from 'react-icons/fi';
import DragDropUpload from '@/components/DragDropUpload';

interface IBannerForm {
  title: string;
  offerDescription: string;
  discount?: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface BannerModalProps {
  isOpen: boolean;
  editingBanner?: any;
  bannerImage: File | null;
  previewUrl: string;
  onClose: () => void;
  onSubmit: (data: IBannerForm) => void;
  onImageUpload: (files: File[]) => void;
  isLoading: boolean;
}

function BannerModal({ 
  isOpen, 
  editingBanner, 
  bannerImage, 
  previewUrl, 
  onClose, 
  onSubmit, 
  onImageUpload, 
  isLoading 
}: BannerModalProps) {
  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = useForm<IBannerForm>({
    defaultValues: {
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });

  const watchedValues = watch();
  console.log('[BannerModal] Form watched values:', {
    startDate: watchedValues.startDate,
    endDate: watchedValues.endDate,
    startDateType: typeof watchedValues.startDate,
    endDateType: typeof watchedValues.endDate
  });

  React.useEffect(() => {
    if (editingBanner) {
      setValue('title', editingBanner.title);
      setValue('offerDescription', editingBanner.linkUrl);
      setValue('discount', editingBanner.discount || undefined);
      setValue('isActive', editingBanner.isActive);
      setValue('startDate', editingBanner.startDate ? new Date(editingBanner.startDate) : new Date());
      setValue('endDate', editingBanner.endDate ? new Date(editingBanner.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } else {
      reset({
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  }, [editingBanner, setValue, reset]);

  const handleFormSubmit: SubmitHandler<IBannerForm> = (data) => {
    console.log('[BannerModal] Form data being submitted:', data);
    console.log('[BannerModal] startDate:', data.startDate, typeof data.startDate);
    console.log('[BannerModal] endDate:', data.endDate, typeof data.endDate);
    console.log('[BannerModal] startDate instanceof Date:', data.startDate instanceof Date);
    console.log('[BannerModal] endDate instanceof Date:', data.endDate instanceof Date);
    console.log('[BannerModal] startDate ISO:', data.startDate ? data.startDate.toISOString() : 'No startDate');
    console.log('[BannerModal] endDate ISO:', data.endDate ? data.endDate.toISOString() : 'No endDate');
    
    if (!bannerImage && !editingBanner) {
      alert('Please select a banner image');
      return;
    }
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit, (errors) => {
          console.log('[BannerModal] Form validation errors:', errors);
        })} className="p-8 space-y-8">
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
                      timeIntervals={5}
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
                      timeIntervals={1}
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
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Campaign Banner Image *
            </label>
            <DragDropUpload
              onFilesChange={onImageUpload}
              multiple={false}
              accept="image/*"
              maxSize={8}
              maxFiles={1}
              label="Upload Campaign Banner"
              description="Upload your promotional banner image. Recommended: 1920x600px for best results."
              files={bannerImage ? [bannerImage] : []}
            />
            
            {/* Image Preview */}
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
              onClick={onClose}
              className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <FiSave className="w-5 h-5" />
              {isLoading 
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
  );
}

export default BannerModal;