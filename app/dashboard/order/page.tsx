'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface OrderItem {
  _id: string
  product: {
    _id: string
    title: string
    images: string[]
  }
  title: string
  price: number
  quantity: number
  selectedSize: string
  image: string
}

interface Order {
  _id: string
  orderNumber: string
  user: {
    _id: string
    name: string
    email: string
  }
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    area: string
    district: string
    division: string
    postalCode: string
    country: string
    addressType: string
    landmark: string
    deliveryZone: string
    deliveryType: string
  }
  paymentInfo: {
    method: string
    paymentStatus: string
    sslTransactionId?: string
    cardType?: string
    amount: number
    currency: string
    paidAt?: Date
  }
  orderStatus: string
  subtotal: number
  shippingCost: number
  tax: number
  totalAmount: number
  notes: string
  deliveryType: string
  createdAt: string
  updatedAt: string
}

function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter })
      }

      const response = await axios.get('/api/order', {
        params,
        withCredentials: true
      })

      if (response.data) {
        setOrders(response.data.orders || [])
        setTotalPages(Math.ceil(response.data.totalCount / 10))
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data)
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    if (!status) return <Package className="w-4 h-4" />
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-gray-600">#{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Customer Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className='text-black'><span className="font-medium text-black">Name:</span> {selectedOrder.user?.name || 'N/A'}</p>
                        <p className='text-black'><span className="font-medium text-black">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                        <p className='text-black'><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className='text-black'><span className="font-medium">Full Name:</span> {selectedOrder.shippingAddress.fullName}</p>
                        <p className='text-black'><span className="font-medium">Address:</span> {selectedOrder.shippingAddress.address}</p>
                        <p className='text-black'><span className="font-medium">Area:</span> {selectedOrder.shippingAddress.area}</p>
                        <p className='text-black'><span className="font-medium">District:</span> {selectedOrder.shippingAddress.district}</p>
                        <p className='text-black'><span className="font-medium">Division:</span> {selectedOrder.shippingAddress.division}</p>
                        {selectedOrder.shippingAddress.postalCode && (
                          <p className='text-black'><span className="font-medium">Postal Code:</span> {selectedOrder.shippingAddress.postalCode}</p>
                        )}
                        <p className='text-black'><span className="font-medium">Country:</span> {selectedOrder.shippingAddress.country}</p>
                        <p className='text-black'><span className="font-medium">Delivery Type:</span> {selectedOrder.shippingAddress.deliveryType}</p>
                        <p className='text-black'><span className="font-medium">Delivery Zone:</span> {selectedOrder.shippingAddress.deliveryZone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="space-y-6">
                    {/* Payment Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className='text-black'><span className="font-medium">Method:</span> {selectedOrder.paymentInfo.method}</p>
                        <p className='text-black'><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-sm ${
                            selectedOrder.paymentInfo.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedOrder.paymentInfo.paymentStatus}
                          </span>
                        </p>
                        {selectedOrder.paymentInfo.sslTransactionId && (
                          <p className='text-black'><span className="font-medium">Transaction ID:</span> {selectedOrder.paymentInfo.sslTransactionId}</p>
                        )}
                        {selectedOrder.paymentInfo.cardType && (
                          <p className='text-black'><span className="font-medium">Payment Type:</span> {selectedOrder.paymentInfo.cardType}</p>
                        )}
                        <p className='text-black'><span className="font-medium">Amount:</span> {formatPrice(selectedOrder.paymentInfo.amount)}</p>
                        {selectedOrder.paymentInfo.paidAt && (
                          <p className='text-black'><span className="font-medium">Paid At:</span> {formatDate(selectedOrder.paymentInfo.paidAt.toString())}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Status & Delivery */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Order Status & Delivery
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className='text-black'><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </p>
                        <p className='text-black'><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                        <p className='text-black'><span className="font-medium">Last Updated:</span> {formatDate(selectedOrder.updatedAt)}</p>
                        <p className='text-black'><span className="font-medium">Delivery Type:</span> {selectedOrder.deliveryType}</p>
                        {selectedOrder.notes && (
                          <p className='text-black'><span className="font-medium">Notes:</span> {selectedOrder.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{item.title}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{formatPrice(item.price)}</td>
                            <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-900">{item.selectedSize}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className='text-black'>Subtotal:</span>
                      <span className='text-black'>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className='text-black'>Shipping Cost:</span>
                      <span className='text-black'>{formatPrice(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className='text-black'>Tax:</span>
                      <span className='text-black'>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className='text-black'>Total:</span>
                        <span className='text-black'>{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Orders will appear here once customers start placing them.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderPage