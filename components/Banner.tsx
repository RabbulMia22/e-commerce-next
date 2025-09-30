'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/pagination';

interface IBanner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  discount?: number;
  startDate?: string;
  endDate?: string;
}

// Countdown Timer Component
const CountdownTimer: React.FC<{ endDate?: string }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const targetDate = new Date(endDate).getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }
      return null;
    };

    // Calculate initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!endDate || !timeLeft) {
    return (
      <div className="hidden lg:block absolute bottom-4 right-4 xl:bottom-6 xl:right-6 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 xl:px-3 xl:py-2 rounded-full text-xs xl:text-sm font-bold animate-pulse">
        <div className="flex items-center gap-1">
          <span className="text-xs">🔥</span>
          <span>Limited Time</span>
        </div>
      </div>
    );
  }

  // Format display to show days, minutes, and seconds together
  const formatTime = () => {
    const parts = [];
    
    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}`);
    }
    
    parts.push(`${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}`);
    parts.push(`${timeLeft.seconds} second${timeLeft.seconds !== 1 ? 's' : ''}`);
    
    return parts.join(' ');
  };

  return (
    <div className="hidden lg:block absolute bottom-4 right-4 xl:bottom-6 xl:right-6 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 xl:px-3 xl:py-2 rounded-lg text-xs xl:text-sm font-bold animate-pulse max-w-[200px] xl:max-w-[220px]">
      <div className="flex items-center gap-1">
        <span className="text-xs">⏰</span>
        <span className="leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{formatTime()}</span>
      </div>
    </div>
  );
};

function Banner() {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const response = await axios.get('/api/banner?active=true');
      return response.data.data as IBanner[];
    },
  });

  // Define different attractive gradient colors for each slide
  const getSlideGradient = (index: number) => {
    const gradients = [
      // Slide 0: Sunset Orange to Hot Pink (Instagram-style)
      'bg-gradient-to-r from-orange-400 to-pink-500 lg:bg-gradient-to-br lg:from-orange-500 lg:via-red-500 lg:to-pink-600',
      // Slide 1: Electric Purple to Neon Blue
      'bg-gradient-to-r from-purple-500 to-blue-500 lg:bg-gradient-to-br lg:from-purple-600 lg:via-indigo-500 lg:to-blue-600',
      // Slide 2: Emerald Green to Turquoise
      'bg-gradient-to-r from-emerald-400 to-teal-500 lg:bg-gradient-to-br lg:from-emerald-500 lg:via-green-500 lg:to-teal-600',
      // Slide 3: Magenta to Deep Purple (Vibrant)
      'bg-gradient-to-r from-fuchsia-500 to-purple-600 lg:bg-gradient-to-br lg:from-fuchsia-600 lg:via-violet-600 lg:to-purple-700',
      // Slide 4: Golden Yellow to Coral Red
      'bg-gradient-to-r from-yellow-400 to-red-500 lg:bg-gradient-to-br lg:from-yellow-500 lg:via-orange-500 lg:to-red-600',
      // Slide 5: Cyan to Electric Blue (Neon)
      'bg-gradient-to-r from-cyan-400 to-blue-600 lg:bg-gradient-to-br lg:from-cyan-500 lg:via-sky-500 lg:to-blue-700',
      // Slide 6: Rose Gold to Deep Pink
      'bg-gradient-to-r from-rose-400 to-pink-600 lg:bg-gradient-to-br lg:from-rose-500 lg:via-pink-500 lg:to-fuchsia-600',
      // Slide 7: Lime Green to Forest Green
      'bg-gradient-to-r from-lime-400 to-green-600 lg:bg-gradient-to-br lg:from-lime-500 lg:via-green-500 lg:to-emerald-700'
    ];
    
    // Cycle through gradients if there are more banners than defined gradients
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-100 animate-pulse">
        <p className="text-gray-600 font-medium">Loading banners...</p>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <p className="text-lg sm:text-xl font-bold">No banners available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
      <Swiper
        pagination={{ dynamicBullets: true, clickable: true }}
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={banners.length > 1}
        className="w-full h-full rounded-lg lg:rounded-xl overflow-hidden shadow-md lg:shadow-2xl"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id}>
            <div className={`relative w-full h-full ${getSlideGradient(index)}`}>
              
              <div className="hidden lg:block absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)'
                  }}>
                </div>
              </div>

              <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
                <div className="grid grid-cols-2 gap-4 lg:gap-8 xl:gap-12 h-full items-center w-full">
                  
                  <div className="flex flex-col justify-center space-y-2 sm:space-y-3 lg:space-y-6 xl:space-y-8 lg:pr-8">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
                      <div className="bg-red-600 text-white px-2 sm:px-3 lg:px-4 xl:px-6 py-1 lg:py-2 rounded-full text-xs sm:text-sm lg:text-base xl:text-lg font-bold animate-pulse">
                         HOT DEAL
                      </div>
                      {banner.discount && (
                        <div className="bg-white text-orange-600 px-2 sm:px-3 lg:px-4 xl:px-6 py-1 lg:py-2 rounded-full text-xs sm:text-sm lg:text-base xl:text-lg font-bold shadow-lg">
                          {banner.discount}% OFF
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 lg:space-y-4">
                      <h1 className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-white leading-tight lg:leading-none drop-shadow-lg">
                        {banner.title}
                      </h1>
                      <div className="w-12 sm:w-16 lg:w-24 xl:w-32 h-1 lg:h-2 bg-white rounded-full"></div>
                    </div>

                    <p className="text-xs sm:text-sm lg:text-lg xl:text-xl text-white opacity-90 lg:opacity-95 leading-relaxed max-w-md lg:max-w-lg xl:max-w-xl">
                      Discover amazing deals and premium quality products at unbeatable prices. Limited time offers!
                    </p>

                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 xl:w-10 xl:h-10 bg-white/20 rounded-full flex items-center justify-center">
                          
                        </div>
                        <span className="text-sm xl:text-base font-medium">Free Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 xl:w-10 xl:h-10 bg-white/20 rounded-full flex items-center justify-center">
                          
                        </div>
                        <span className="text-sm xl:text-base font-medium">Easy Returns</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 xl:w-10 xl:h-10 bg-white/20 rounded-full flex items-center justify-center">
                          
                        </div>
                        <span className="text-sm xl:text-base font-medium">4.8 Rating</span>
                      </div>
                    </div>

                    <Link href={banner.linkUrl}>
                      <button className="bg-white text-orange-600 font-semibold py-2 px-4 sm:px-6 lg:py-4 lg:px-8 xl:py-5 xl:px-12 rounded-full text-xs sm:text-sm lg:text-base xl:text-lg hover:bg-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 lg:gap-3 w-fit">
                         Shop Now
                        <svg
                          className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </button>
                    </Link>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="relative w-full h-[350px] sm:h-[250px] lg:h-[350px] xl:h-[450px] 2xl:h-[500px]">
                      
                      <div className="relative w-full h-full lg:bg-white/10 lg:backdrop-blur-sm lg:rounded-2xl lg:p-4 xl:p-6">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 40vw, 35vw"
                          className="object-contain hover:scale-105 transition-transform duration-500"
                          priority={index === 0}
                        />
                      </div>

                      {banner.discount && (
                        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 xl:top-6 xl:right-6 bg-red-600 text-white px-2 py-1 lg:px-3 lg:py-2 xl:px-4 xl:py-3 rounded-full text-xs lg:text-sm xl:text-base font-bold shadow-lg">
                          -{banner.discount}%
                        </div>
                      )}

                      <div className="hidden lg:flex absolute top-4 left-4 xl:top-6 xl:left-6 w-10 h-10 xl:w-12 xl:h-12 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                        <span className="text-white text-lg xl:text-xl">🔥</span>
                      </div>

                      <CountdownTimer endDate={banner.endDate} />
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 lg:top-8 lg:right-8 xl:top-12 xl:right-12 w-12 h-12 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 xl:bottom-12 xl:left-12 w-8 h-8 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-white/20 rounded-full animate-bounce"></div>
                
                <div className="hidden lg:block absolute top-1/3 right-1/4 w-6 h-6 xl:w-8 xl:h-8 bg-white/10 rounded-full animate-ping"></div>
                <div className="hidden lg:block absolute bottom-1/3 left-1/4 w-4 h-4 xl:w-6 xl:h-6 bg-white/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Banner;
