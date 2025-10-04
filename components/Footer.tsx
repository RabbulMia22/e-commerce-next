'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
  FaCreditCard,
  FaShieldAlt,
  FaTruck,
  FaUndoAlt
} from 'react-icons/fa'

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const socialVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.2 }
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-16 sm:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-gray-100" />
        </svg>
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6 sm:pb-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Features Section */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
          variants={itemVariants}
        >
          {[
            { icon: FaTruck, title: 'Free Shipping', desc: 'On orders over $99' },
            { icon: FaUndoAlt, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: FaShieldAlt, title: 'Secure Payment', desc: '100% protected' },
            { icon: FaCreditCard, title: 'Payment Options', desc: 'Multiple methods' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-orange-400/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              variants={itemVariants}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mb-3 sm:mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="text-white text-lg sm:text-xl" />
              </motion.div>
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div 
              className="flex items-center mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xl sm:text-2xl px-3 sm:px-4 py-2 rounded-lg mr-2 sm:mr-3">
                S
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                ShopMate
              </span>
            </motion.div>
            <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
              Your trusted partner for premium quality products. We bring you the best shopping experience with exceptional service and unbeatable prices.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3 sm:space-x-4">
              {[
                { icon: FaFacebookF, color: 'hover:text-blue-500', bg: 'hover:bg-blue-500/20' },
                { icon: FaTwitter, color: 'hover:text-sky-500', bg: 'hover:bg-sky-500/20' },
                { icon: FaInstagram, color: 'hover:text-pink-500', bg: 'hover:bg-pink-500/20' },
                { icon: FaLinkedinIn, color: 'hover:text-blue-600', bg: 'hover:bg-blue-600/20' },
                { icon: FaYoutube, color: 'hover:text-red-500', bg: 'hover:bg-red-500/20' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 transition-all duration-300 ${social.color} ${social.bg} border border-white/10 hover:border-current`}
                  variants={socialVariants}
                  whileHover="hover"
                >
                  <social.icon className="text-sm sm:text-base" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {['Home', 'Products', 'About Us', 'Contact', 'Blog', 'FAQ'].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link 
                    href="#" 
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center group text-sm sm:text-base"
                  >
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 sm:mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Categories
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {['Electronics', 'Clothing', 'Accessories', 'Shoes', 'Bags', 'Sports'].map((category, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link 
                    href="#" 
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center group text-sm sm:text-base"
                  >
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 sm:mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {category}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <motion.div 
                className="flex items-start sm:items-center group"
                whileHover={{ x: 5 }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <FaMapMarkerAlt className="text-white text-xs sm:text-sm" />
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    123 Commerce Street<br />
                    Business District, BD 12345
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start sm:items-center group"
                whileHover={{ x: 5 }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <FaPhone className="text-white text-xs sm:text-sm" />
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-base">+880 123 456 789</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Mon-Fri 9AM-6PM</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start sm:items-center group"
                whileHover={{ x: 5 }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <FaEnvelope className="text-white text-xs sm:text-sm" />
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-base">support@shopmate.com</p>
                  <p className="text-gray-400 text-xs sm:text-sm">24/7 Support</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div 
          className="bg-gradient-to-r from-orange-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-white/10"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-0">
            <div className="mb-4 sm:mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                Stay Updated
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">Subscribe to our newsletter for exclusive deals and latest updates</p>
            </div>
            <div className="flex w-full md:w-auto flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 w-full md:w-64 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-300 focus:outline-none focus:border-orange-400 backdrop-blur-sm text-sm sm:text-base mb-2 sm:mb-0 sm:mr-0 md:mr-0"
              />
              <motion.button
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-r-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-white/10 pt-6 sm:pt-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-0">
            <motion.p 
              className="text-gray-400 text-xs sm:text-sm mb-4 md:mb-0 flex items-center justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              © 2025 ShopMate. Made with 
              <motion.span
                className="text-red-500 mx-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FaHeart />
              </motion.span>
              by Your Team. All rights reserved.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Link href="/privacy" className="hover:text-orange-400 transition-colors duration-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-orange-400 transition-colors duration-300">Terms of Service</Link>
              <Link href="/privacy#cookies" className="hover:text-orange-400 transition-colors duration-300">Cookies</Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-600 to-orange-500"></div>
    </footer>
  )
}

export default Footer;