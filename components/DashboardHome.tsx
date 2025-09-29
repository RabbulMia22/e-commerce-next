'use client';

import React from 'react';
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

// Mock data for the dashboard
const stats = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    trend: 'up',
    icon: FiDollarSign,
    color: 'bg-green-500'
  },
  {
    title: 'Total Orders',
    value: '2,345',
    change: '+15.3%',
    trend: 'up',
    icon: FiShoppingCart,
    color: 'bg-blue-500'
  },
  {
    title: 'Total Products',
    value: '1,234',
    change: '+2.5%',
    trend: 'up',
    icon: FiPackage,
    color: 'bg-purple-500'
  },
  {
    title: 'Active Users',
    value: '573',
    change: '-0.5%',
    trend: 'down',
    icon: FiUsers,
    color: 'bg-orange-500'
  }
];

const recentOrders = [
  { id: '#3021', customer: 'John Doe', product: 'iPhone 14 Pro', amount: '$999.00', status: 'Completed', date: '2 min ago' },
  { id: '#3020', customer: 'Jane Smith', product: 'MacBook Air', amount: '$1,299.00', status: 'Processing', date: '5 min ago' },
  { id: '#3019', customer: 'Mike Johnson', product: 'AirPods Pro', amount: '$249.00', status: 'Shipped', date: '10 min ago' },
  { id: '#3018', customer: 'Sarah Wilson', product: 'iPad Pro', amount: '$1,099.00', status: 'Completed', date: '15 min ago' },
  { id: '#3017', customer: 'Tom Brown', product: 'Apple Watch', amount: '$399.00', status: 'Pending', date: '20 min ago' }
];

const topProducts = [
  { name: 'iPhone 14 Pro', sales: 234, revenue: '$233,400', growth: '+12%' },
  { name: 'MacBook Air M2', sales: 156, revenue: '$202,740', growth: '+8%' },
  { name: 'AirPods Pro 2', sales: 432, revenue: '$107,568', growth: '+15%' },
  { name: 'iPad Air', sales: 98, revenue: '$58,802', growth: '+5%' },
  { name: 'Apple Watch Series 8', sales: 167, revenue: '$66,633', growth: '+10%' }
];

function DashboardHome() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <FiArrowUpRight className="text-green-500 w-4 h-4" />
                  ) : (
                    <FiArrowDownRight className="text-red-500 w-4 h-4" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
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
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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