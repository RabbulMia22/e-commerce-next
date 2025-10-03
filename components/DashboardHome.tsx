'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiShoppingBag, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp,
  FiPackage,
  FiShoppingCart,
  FiEye,
  FiArrowUpRight,
  FiArrowDownRight
} from 'react-icons/fi';

// Interface for dashboard stats
interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  activeUsers: number
  revenueGrowth: number
  orderGrowth: number
  productGrowth: number
  userGrowth: number
}

// Interface for Order data
interface Order {
  _id: string
  orderNumber: string
  user: {
    _id: string
    name: string
    email: string
  }
  items: Array<{
    _id: string
    title: string
    price: number
    quantity: number
    selectedSize: string
    image: string
  }>
  orderStatus: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

const topProducts = [
  { name: 'iPhone 14 Pro', sales: 234, revenue: '$233,400', growth: '+12%' },
  { name: 'MacBook Air M2', sales: 156, revenue: '$202,740', growth: '+8%' },
  { name: 'AirPods Pro 2', sales: 432, revenue: '$107,568', growth: '+15%' },
  { name: 'iPad Air', sales: 98, revenue: '$58,802', growth: '+5%' },
  { name: 'Apple Watch Series 8', sales: 167, revenue: '$66,633', growth: '+10%' }
];

function DashboardHome() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeUsers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    productGrowth: 0,
    userGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch all data in parallel
      await Promise.all([
        fetchRecentOrders(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch orders for revenue and order count
      const ordersResponse = await axios.get('/api/order', {
        params: { limit: '1000' }, // Get more orders for accurate calculations
        withCredentials: true
      })

      // Fetch products for product count - try different approaches
      let productsResponse;
      try {
        productsResponse = await axios.get('/api/products', {
          params: { limit: '1000' }, // Add limit parameter like orders
          withCredentials: true
        })
      } catch (productError) {
        console.log('First products fetch failed, trying without params...')
        productsResponse = await axios.get('/api/products', {
          withCredentials: true
        })
      }

      console.log('Products Response Full:', productsResponse) // Debug log
      console.log('Products Response Data:', productsResponse.data) // Debug log

      const orders = ordersResponse.data?.orders || []
      
      // Check multiple possible response structures for products
      let products = [];
      if (Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      } else if (productsResponse.data?.products && Array.isArray(productsResponse.data.products)) {
        products = productsResponse.data.products;
      } else if (productsResponse.data?.data && Array.isArray(productsResponse.data.data)) {
        products = productsResponse.data.data;
      } else {
        console.log('Products response structure not recognized:', typeof productsResponse.data)
        products = [];
      }

      console.log('Products Array:', products) // Debug log
      console.log('Products Count:', products.length)

      // Calculate revenue metrics
      calculateDashboardStats(orders, products)
    } catch (error) {
      console.error('Error fetching stats:', error)
      if (axios.isAxiosError(error)) {
        console.error('Products API Error:', error.response?.data)
      }
    }
  }

  const calculateDashboardStats = (orders: Order[], products: any[]) => {
    // Ensure products is an array and log for debugging
    const productsArray = Array.isArray(products) ? products : []
    console.log('Final Products Array in calculateDashboardStats:', productsArray)
    console.log('Products Count in calculateDashboardStats:', productsArray.length)

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Ensure orders is an array
    const ordersArray = Array.isArray(orders) ? orders : []

    // Filter completed orders only
    const completedOrders = ordersArray.filter(order => 
      order?.orderStatus === 'delivered' || 
      (order as any)?.paymentInfo?.paymentStatus === 'completed'
    )

    // Calculate total revenue
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Calculate growth metrics
    const last30DaysOrders = completedOrders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    )
    const previous30DaysOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo
    })

    const last30DaysRevenue = last30DaysOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const previous30DaysRevenue = previous30DaysOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Calculate growth percentages
    const revenueGrowth = previous30DaysRevenue > 0 
      ? ((last30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue) * 100 
      : 0

    const orderGrowth = previous30DaysOrders.length > 0
      ? ((last30DaysOrders.length - previous30DaysOrders.length) / previous30DaysOrders.length) * 100
      : 0

    // Get unique users (simplified - count unique user emails from orders)
    const uniqueUsers = new Set(ordersArray.map(order => order.user?.email).filter(Boolean))

    const statsToSet = {
      totalRevenue,
      totalOrders: completedOrders.length,
      totalProducts: productsArray.length,
      activeUsers: uniqueUsers.size,
      revenueGrowth,
      orderGrowth,
      productGrowth: 0, // You can calculate this if you have historical product data
      userGrowth: 0 // You can calculate this if you have user registration dates
    }

    console.log('Setting Dashboard Stats:', statsToSet) // Debug log

    setDashboardStats(statsToSet)
  }

  const fetchRecentOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/order', {
        params: {
          page: '1',
          limit: '5', // Only get 5 recent orders for dashboard
        },
        withCredentials: true
      })

      if (response.data) {
        setRecentOrders(response.data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      setRecentOrders([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed': 
        return 'bg-green-100 text-green-800'
      case 'processing': 
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped': 
        return 'bg-blue-100 text-blue-800'
      case 'pending': 
        return 'bg-gray-100 text-gray-800'
      case 'cancelled': 
        return 'bg-red-100 text-red-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Link href="/dashboard/revenue" className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(dashboardStats.totalRevenue || 0)}</p>
              <div className="flex items-center mt-2">
                {(dashboardStats.revenueGrowth || 0) >= 0 ? (
                  <FiArrowUpRight className="text-green-500 w-4 h-4" />
                ) : (
                  <FiArrowDownRight className="text-red-500 w-4 h-4" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  (dashboardStats.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(dashboardStats.revenueGrowth || 0) >= 0 ? '+' : ''}{Math.abs(dashboardStats.revenueGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Link href="/dashboard/order" className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{(dashboardStats.totalOrders || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {(dashboardStats.orderGrowth || 0) >= 0 ? (
                  <FiArrowUpRight className="text-green-500 w-4 h-4" />
                ) : (
                  <FiArrowDownRight className="text-red-500 w-4 h-4" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  (dashboardStats.orderGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(dashboardStats.orderGrowth || 0) >= 0 ? '+' : ''}{Math.abs(dashboardStats.orderGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <FiShoppingCart className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <Link href="/dashboard/products" className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{(dashboardStats.totalProducts || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {(dashboardStats.productGrowth || 0) >= 0 ? (
                  <FiArrowUpRight className="text-green-500 w-4 h-4" />
                ) : (
                  <FiArrowDownRight className="text-red-500 w-4 h-4" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  (dashboardStats.productGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(dashboardStats.productGrowth || 0) >= 0 ? '+' : ''}{Math.abs(dashboardStats.productGrowth || 0).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm ml-1">in catalog</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{(dashboardStats.activeUsers || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <FiUsers className="text-orange-500 w-4 h-4" />
                <span className="text-gray-500 text-sm ml-1">unique customers</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link 
                  href="/dashboard/order" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            <span className="ml-2 text-gray-500">Loading recent orders...</span>
                          </div>
                        </td>
                      </tr>
                    ) : recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.user?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.items.length > 0 
                              ? order.items[0].title + (order.items.length > 1 ? ` +${order.items.length - 1} more` : '')
                              : 'No items'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
              <p className="text-gray-600 text-sm mt-1">Best performing products this month</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                      <div className="flex items-center mt-1 space-x-4">
                        <span className="text-xs text-gray-500">{product.sales} sales</span>
                        <span className="text-xs font-medium text-green-600">{product.growth}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-sm">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <FiPackage className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                  <span className="text-sm font-medium text-gray-700 mt-2">Add Product</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group">
                  <FiShoppingBag className="w-8 h-8 text-green-600 group-hover:text-green-700" />
                  <span className="text-sm font-medium text-gray-700 mt-2">View Orders</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group">
                  <FiUsers className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
                  <span className="text-sm font-medium text-gray-700 mt-2">Customers</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group">
                  <FiTrendingUp className="w-8 h-8 text-orange-600 group-hover:text-orange-700" />
                  <span className="text-sm font-medium text-gray-700 mt-2">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
                  7 days
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
                  30 days
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
                  90 days
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiTrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Revenue chart will be displayed here</p>
                <p className="text-sm text-gray-500 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;