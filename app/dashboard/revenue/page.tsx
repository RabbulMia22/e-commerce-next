'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: number
  dailyRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueGrowth: number
  orderGrowth: number
}

interface OrderStats {
  _id: string
  totalAmount: number
  orderStatus: string
  paymentInfo: {
    method: string
    paymentStatus: string
    amount: number
  }
  createdAt: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([])
  const [recentTransactions, setRecentTransactions] = useState<OrderStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRevenueData()
  }, [selectedPeriod])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      
      // Fetch all orders for revenue calculation
      const ordersResponse = await axios.get('/api/order', {
        params: {
          limit: '1000', // Get more orders for accurate calculations
        },
        withCredentials: true
      })

      if (ordersResponse.data && ordersResponse.data.orders) {
        const orders = ordersResponse.data.orders || []
        calculateRevenueMetrics(orders)
        setRecentTransactions(Array.isArray(orders) ? orders.slice(0, 10) : []) // Latest 10 transactions
      } else {
        // Handle case when no orders data is returned
        calculateRevenueMetrics([])
        setRecentTransactions([])
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      // Set default values on error
      calculateRevenueMetrics([])
      setRecentTransactions([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateRevenueMetrics = (orders: OrderStats[]) => {
    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      orders = []
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Filter completed orders only
    const completedOrders = orders.filter(order => 
      order?.paymentInfo?.paymentStatus === 'completed' || 
      order?.orderStatus === 'delivered'
    )

    // Total revenue (all time)
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Last 30 days revenue
    const last30DaysOrders = completedOrders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    )
    const monthlyRevenue = last30DaysOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Previous 30 days revenue (for growth calculation)
    const previous30DaysOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo
    })
    const previousMonthRevenue = previous30DaysOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Today's revenue
    const todayOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= today
    })
    const dailyRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate growth percentages
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0

    const orderGrowth = previous30DaysOrders.length > 0
      ? ((last30DaysOrders.length - previous30DaysOrders.length) / previous30DaysOrders.length) * 100
      : 0

    // Average order value
    const averageOrderValue = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0

    // Monthly breakdown for chart
    const monthlyBreakdown = calculateMonthlyBreakdown(completedOrders)

    setRevenueData({
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      totalOrders: completedOrders.length,
      averageOrderValue,
      revenueGrowth,
      orderGrowth
    })

    setMonthlyData(monthlyBreakdown)
  }

  const calculateMonthlyBreakdown = (orders: OrderStats[]): MonthlyRevenue[] => {
    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      return []
    }

    const monthlyMap = new Map<string, { revenue: number; orders: number }>()
    
    orders.forEach(order => {
      // Add safety checks for order properties
      if (!order?.createdAt || !order?.totalAmount) return
      
      const date = new Date(order.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { revenue: 0, orders: 0 })
      }
      
      const current = monthlyMap.get(monthKey)!
      current.revenue += order.totalAmount || 0
      current.orders += 1
    })

    return Array.from(monthlyMap.entries())
      .map(([key, data]) => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        ...data
      }))
      .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime())
      .slice(-6) // Last 6 months
  }

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

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'sslcommerz':
        return 'bg-blue-100 text-blue-800'
      case 'bkash':
        return 'bg-pink-100 text-pink-800'
      case 'nagad':
        return 'bg-orange-100 text-orange-800'
      case 'rocket':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRevenueData()
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Revenue Analytics</h1>
            <p className="text-gray-600 text-sm sm:text-base">Track your store's financial performance and growth</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Time Period Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export Button */}
            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {formatPrice(revenueData.totalRevenue)}
              </p>
              <div className="flex items-center mt-1 sm:mt-2">
                {revenueData.revenueGrowth >= 0 ? (
                  <TrendingUp className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <TrendingDown className="text-red-500 w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className={`text-xs sm:text-sm font-medium ml-1 ${
                  revenueData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(revenueData.revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">vs last month</span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 ml-2 sm:ml-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {formatPrice(revenueData.monthlyRevenue)}
              </p>
              <div className="flex items-center mt-1 sm:mt-2">
                <Calendar className="text-blue-500 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-gray-500 ml-1">
                  Last 30 days
                </span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 ml-2 sm:ml-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Daily Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {formatPrice(revenueData.dailyRevenue)}
              </p>
              <div className="flex items-center mt-1 sm:mt-2">
                <Package className="text-purple-500 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-gray-500 ml-1">
                  Today's earnings
                </span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0 ml-2 sm:ml-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Average Order Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {formatPrice(revenueData.averageOrderValue)}
              </p>
              <div className="flex items-center mt-1 sm:mt-2">
                <ShoppingCart className="text-orange-500 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-gray-500 ml-1">
                  {revenueData.totalOrders} orders
                </span>
              </div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0 ml-2 sm:ml-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Monthly Revenue Trend</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Revenue breakdown by month</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {monthlyData.map((month, index) => {
                const maxRevenue = Math.max(...monthlyData.map(m => m.revenue))
                const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{month.month}</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatPrice(month.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block sm:inline">
                        {month.orders} orders
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Revenue Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Revenue Summary</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Key performance indicators</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Growth Metrics */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Revenue Growth</p>
                    <p className="text-xs sm:text-sm text-gray-600">Month over month</p>
                  </div>
                </div>
                <span className={`text-base sm:text-lg font-bold ${
                  revenueData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {revenueData.revenueGrowth >= 0 ? '+' : ''}{revenueData.revenueGrowth.toFixed(1)}%
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Order Growth</p>
                    <p className="text-xs sm:text-sm text-gray-600">Month over month</p>
                  </div>
                </div>
                <span className={`text-base sm:text-lg font-bold ${
                  revenueData.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {revenueData.orderGrowth >= 0 ? '+' : ''}{revenueData.orderGrowth.toFixed(1)}%
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Total Orders</p>
                    <p className="text-xs sm:text-sm text-gray-600">All time completed</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-bold text-purple-600">
                  {revenueData.totalOrders.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Latest completed orders</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-medium">
              View All Transactions
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] sm:min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Amount
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 sm:px-4 md:px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {transaction.paymentInfo?.method === 'sslcommerz' ? 'SSL' : 'ORD'}-{transaction._id?.slice(-8) || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900 hidden sm:table-cell">
                      {formatPrice(transaction.totalAmount)}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(transaction.paymentInfo.method)}`}>
                        {transaction.paymentInfo.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.paymentInfo.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.paymentInfo.paymentStatus}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default RevenuePage