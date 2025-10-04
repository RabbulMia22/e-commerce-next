'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Package,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Plus,
  X,
  Star,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  _id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  brand: string
  hasSize: boolean
  availableSizes: string[]
  stock: number
  rating: number
  createdAt: string
  updatedAt: string
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newSize, setNewSize] = useState('')

  // Size management functions
  const addSize = () => {
    if (newSize.trim() && editingProduct && (!editingProduct.availableSizes || !editingProduct.availableSizes.includes(newSize.trim()))) {
      setEditingProduct({
        ...editingProduct,
        availableSizes: [...(editingProduct.availableSizes || []), newSize.trim()]
      })
      setNewSize('')
    }
  }

  const removeSize = (sizeToRemove: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        availableSizes: editingProduct.availableSizes?.filter(size => size !== sizeToRemove) || []
      })
    }
  }

  const addPredefinedSize = (size: string) => {
    if (editingProduct && (!editingProduct.availableSizes || !editingProduct.availableSizes.includes(size))) {
      setEditingProduct({
        ...editingProduct,
        availableSizes: [...(editingProduct.availableSizes || []), size]
      })
    }
  }

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [currentPage, categoryFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage.toString(),
        limit: '10'
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter
      }

      const response = await axios.get('/api/products', {
        params,
        withCredentials: true
      })

      console.log('Products API Response:', response.data)

      // Handle different response structures
      let productsData = []
      let totalCount = 0

      if (Array.isArray(response.data)) {
        productsData = response.data
        totalCount = response.data.length
      } else if (response.data?.products) {
        productsData = response.data.products
        totalCount = response.data.totalCount || response.data.products.length
      } else if (response.data?.data) {
        productsData = response.data.data
        totalCount = response.data.totalCount || response.data.data.length
      }

      setProducts(productsData)
      setTotalPages(Math.ceil(totalCount / 10))
    } catch (error) {
      console.error('Error fetching products:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data)
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'electronics':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'clothing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'accessories':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'shoes':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'bags':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' }
    } else if (stock <= 10) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' }
    }
  }

  // Delete product function
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await axios.delete(`/api/products?id=${productId}`)
      
      if (response.data.success) {
        // Remove product from local state
        setProducts(products.filter(p => p._id !== productId))
        setDeleteConfirm(null)
        
        // Show success message (you can add toast notification here)
        alert('Product deleted successfully!')
      } else {
        alert('Failed to delete product: ' + (response.data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      if (axios.isAxiosError(error)) {
        alert('Failed to delete product: ' + (error.response?.data?.error || error.message))
      } else {
        alert('Failed to delete product: Unknown error')
      }
    }
  }

  // Update product function
  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const formData = new FormData()
      
      // Add product ID (required by the API)
      formData.append('id', updatedProduct._id)
      
      // Add basic product data with null checks
      formData.append('title', updatedProduct.title || '')
      formData.append('description', updatedProduct.description || '')
      formData.append('price', (updatedProduct.price || 0).toString())
      formData.append('category', updatedProduct.category || '')
      formData.append('brand', updatedProduct.brand || 'Generic')
      formData.append('stock', (updatedProduct.stock || 0).toString())
      formData.append('rating', (updatedProduct.rating || 0).toString())
      
      // Add sizes and colors as JSON strings
      formData.append('hasSize', updatedProduct.hasSize.toString())
      if (updatedProduct.hasSize && updatedProduct.availableSizes && updatedProduct.availableSizes.length > 0) {
        formData.append('availableSizes', JSON.stringify(updatedProduct.availableSizes))
      }

      const response = await axios.put('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        // Update product in local state
        setProducts(products.map(p => 
          p._id === updatedProduct._id ? response.data.data : p
        ))
        setEditingProduct(null)
        alert('Product updated successfully!')
      } else {
        alert('Failed to update product: ' + (response.data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating product:', error)
      if (axios.isAxiosError(error)) {
        alert('Failed to update product: ' + (error.response?.data?.error || error.message))
      } else {
        alert('Failed to update product: Unknown error')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Products Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and view all products in your store</p>
          </div>
          
          <Link
            href="/dashboard/addProducts"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by product name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black text-sm"
            />
          </div>

          {/* Category Filter & Export */}
          <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="relative flex-1 md:flex-none min-w-0 w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 sm:pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white w-full text-sm"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] sm:min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Stock
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Added Date
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 sm:px-4 md:px-6 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0)
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-4">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {product.title}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 max-w-xs truncate mt-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(product.category)}`}>
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(product.price || 0)}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {product.stock || 0} units
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-start"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-start"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(product._id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-start"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-2  py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3 sm:gap-0 sm:px-6">
            <div className="w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none min-w-[100px] sm:min-w-0"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none min-w-[100px] sm:min-w-0"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    Product Details
                  </h2>
                  <p className="text-gray-600 text-sm truncate">{selectedProduct.title}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Product Images */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Product Images</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        selectedProduct.images.map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`${selectedProduct.title} ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-200"
                          />
                        ))
                      ) : (
                        <div className="w-full h-32 sm:h-48 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                          <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Basic Information</h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                        <div>
                          <span className="font-medium">Title:</span>
                          <p className="text-gray-700 mt-1 text-sm">{selectedProduct.title}</p>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-gray-700 mt-1 text-sm">{selectedProduct.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(selectedProduct.category)}`}>
                            {selectedProduct.category || 'Uncategorized'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Price:</span>
                          <span className="ml-2 text-base sm:text-lg font-bold text-green-600">
                            {formatPrice(selectedProduct.price || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Variants */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Product Configuration</h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                        <div>
                          <span className="font-medium">Has Sizes:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs sm:text-sm ${
                            selectedProduct.hasSize ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {selectedProduct.hasSize ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {selectedProduct.hasSize && (
                          <div>
                            <span className="font-medium">Available Sizes:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 ? (
                                selectedProduct.availableSizes.map((size, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs sm:text-sm">
                                    {size}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No sizes specified</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock & Status */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Stock & Status</h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Stock Quantity:</span>
                          <span className="text-base sm:text-lg font-bold">{selectedProduct.stock || 0} units</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Stock Status:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStockStatus(selectedProduct.stock || 0).color}`}>
                            {getStockStatus(selectedProduct.stock || 0).text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{selectedProduct.rating || 0}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Timeline</h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Created:</span>
                          <span className="text-sm">{formatDate(selectedProduct.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Last Updated:</span>
                          <span className="text-sm">{formatDate(selectedProduct.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 justify-end border-t pt-4 sm:pt-6">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm w-full sm:w-auto"
                  >
                    Close
                  </button>
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto justify-center">
                    <Edit className="w-4 h-4" />
                    Edit Product
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Edit Product</h2>
                  <p className="text-gray-600 text-sm truncate">{editingProduct.title}</p>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateProduct(editingProduct)
                }}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={editingProduct.title || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        title: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        category: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="accessories">Accessories</option>
                      <option value="shoes">Shoes</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      description: e.target.value
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingProduct.hasSize || false}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        hasSize: e.target.checked,
                        availableSizes: e.target.checked ? editingProduct.availableSizes || [] : []
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Product has sizes</span>
                  </label>

                  {/* Size Management */}
                  {editingProduct.hasSize && (
                    <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Size Selection</label>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => addPredefinedSize(size)}
                              disabled={editingProduct.availableSizes?.includes(size)}
                              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border transition-all ${
                                editingProduct.availableSizes?.includes(size)
                                  ? 'bg-green-500 text-white border-green-500 cursor-not-allowed'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              {size} {editingProduct.availableSizes?.includes(size) && '✓'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Size</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            placeholder="Enter custom size (e.g., 30, 32, UK 8)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            type="button"
                            onClick={addSize}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {editingProduct.availableSizes && editingProduct.availableSizes.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Sizes</label>
                          <div className="flex flex-wrap gap-2">
                            {editingProduct.availableSizes.map((size) => (
                              <span
                                key={size}
                                className="inline-flex items-center bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                              >
                                {size}
                                <button
                                  type="button"
                                  onClick={() => removeSize(size)}
                                  className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800 text-xs"
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

                <div className="flex gap-3 sm:gap-4 justify-end border-t pt-4 sm:pt-6">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto justify-center"
                  >
                    <Edit className="w-4 h-4" />
                    Update Product
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Delete Product</h3>
                    <p className="text-gray-600 text-sm">Are you sure you want to delete this product?</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-red-800 text-sm">
                    <strong>Warning:</strong> This action cannot be undone. The product will be permanently removed from your store.
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(deleteConfirm)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex-1 sm:flex-none justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductsPage