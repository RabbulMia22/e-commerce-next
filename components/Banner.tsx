'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiTag, 
  FiTrendingUp,
  FiShoppingBag,
  FiArrowRight
} from 'react-icons/fi';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface IBanner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function Banner() {
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active banners
  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const response = await axios.get('/api/banner?active=true');
      return response.data.data as IBanner[];
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (bannersLoading || isLoading) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading exciting offers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center px-4">
            <FiTag className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Amazing Offers Coming Soon!</h2>
            <p className="text-lg opacity-90">Stay tuned for incredible deals and promotions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          el: '.swiper-pagination-custom',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} w-3 h-3 bg-white bg-opacity-50 rounded-full cursor-pointer transition-all duration-300 hover:bg-opacity-100"></span>`;
          },
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        loop={banners.length > 1}
        className="w-full h-full"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id}>
            <div className="relative w-full h-full overflow-hidden bg-gray-900">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-[7000ms] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="max-w-2xl">
                    {/* Animated Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-full mb-6 animate-pulse shadow-lg">
                      <FiTrendingUp className="w-4 h-4 mr-2" />
                      LIMITED TIME OFFER
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                      <span className="block transform transition-all duration-1000 delay-300 translate-y-0 opacity-100">
                        {banner.title.split(' ').map((word, i) => (
                          <span
                            key={i}
                            className="inline-block mr-3 animate-fadeInUp"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {word}
                          </span>
                        ))}
                      </span>
                    </h1>

                    {/* Offer Description */}
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed animate-fadeInUp animation-delay-500">
                      {banner.linkUrl}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp animation-delay-700">
                      <button className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                        <FiShoppingBag className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                        Shop Now
                        <FiArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <button className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold text-lg rounded-full border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300">
                        Learn More
                      </button>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-3 mt-8 animate-fadeInUp animation-delay-1000">
                      {['Free Shipping', '30-Day Returns', '24/7 Support'].map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-30 animate-bounce"></div>
              <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white rounded-full opacity-40 animate-ping"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button className="swiper-button-prev-custom absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100">
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button className="swiper-button-next-custom absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100">
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Custom Pagination */}
      {banners.length > 1 && (
        <div className="swiper-pagination-custom absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2"></div>
      )}

      {/* Slide Counter */}
      {banners.length > 1 && (
        <div className="absolute top-8 right-8 z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
          1 / {banners.length}
        </div>
      )}
    </div>
  );
}

export default Banner;