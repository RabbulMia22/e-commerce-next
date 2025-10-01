"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useBasketStore from '@/store/store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';

function CartPage() {
  const {
    basket: items,
    addToBasket,
    removeFromBasket,
    removeItemCompletely,
    clearBasket,
    getTotalPrice,
    getItemCount
  } = useBasketStore();

  // Calculate totals using useMemo to prevent recalculation
  const { itemCount, totalPrice, subtotal, shipping, tax, total } = useMemo(() => {
    const totalPrice = getTotalPrice();
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = totalPrice;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    return { itemCount, totalPrice, subtotal, shipping, tax, total };
  }, [items, getTotalPrice]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityIncrease = (productId: string, selectedSize: string) => {
    const item = items.find(item => 
      item.product._id === productId && item.selectedSize === selectedSize
    );
    if (item) {
      addToBasket(item.product, selectedSize);
    }
  };

  const handleQuantityDecrease = (productId: string, selectedSize: string) => {
    removeFromBasket(productId, selectedSize);
  };

  const handleRemoveItem = (productId: string, selectedSize: string) => {
    removeItemCompletely(productId, selectedSize);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-8">
              <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <Link 
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  {items.length > 0 && (
                    <button
                      onClick={clearBasket}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.selectedSize}`} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || '/placeholder-image.jpg'}
                          alt={item.product.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              <Link 
                                href={`/products/${item.product._id}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {item.product.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600 text-sm mb-1">{item.product.brand}</p>
                            <p className="text-gray-600 text-sm mb-2">
                              Size: <span className="font-medium">{item.selectedSize}</span>
                            </p>
                            <p className="text-gray-500 text-sm line-clamp-2">{item.product.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.product.price)}
                            </p>
                            <p className="text-sm text-gray-500">each</p>
                          </div>
                        </div>

                        {/* Quantity Controls and Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityDecrease(item.product._id, item.selectedSize)}
                                className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="px-3 py-1 text-sm font-medium bg-gray-50 min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityIncrease(item.product._id, item.selectedSize)}
                                className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              ({item.product.stock} available)
                            </span>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                              <p className="text-xs text-gray-500">subtotal</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.product._id, item.selectedSize)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {shipping > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    💡 Add {formatPrice(50 - subtotal)} more for free shipping!
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center mb-3">
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span>🔒</span>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">We accept:</p>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    MC
                  </div>
                  <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    AMEX
                  </div>
                  <div className="w-8 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    PP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed or Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-center py-8">
              Recommended products will appear here based on your cart items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;