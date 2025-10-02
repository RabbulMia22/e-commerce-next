import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Order from '@/models/order';
import { Product } from '@/models/products';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { 
      items, 
      shippingAddress, 
      paymentInfo, 
      subtotal, 
      shippingCost, 
      tax, 
      discount = 0, 
      totalAmount,
      notes 
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    if (!shippingAddress || !paymentInfo || !totalAmount) {
      return NextResponse.json({ error: 'Missing required order information' }, { status: 400 });
    }

    // Validate and check product availability
    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return NextResponse.json({ 
          error: `Product ${item.title} not found` 
        }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.title}. Available: ${product.stock}` 
        }, { status: 400 });
      }

      // Add validated item with current product details
      validatedItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        image: product.images?.[0] || '/placeholder-image.jpg',
        brand: product.brand
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // 🔧 FIX: Use the correct user ID property
    const userId = (session.user as any).id || session.user.email;

    // Create the order
    const newOrder = new Order({
      user: userId,
      items: validatedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        area: shippingAddress.area,
        district: shippingAddress.district,
        division: shippingAddress.division,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Bangladesh',
        addressType: shippingAddress.addressType,
        landmark: shippingAddress.landmark
      },
      paymentInfo: {
        method: paymentInfo.method,
        sslTransactionId: paymentInfo.sslTransactionId,
        sslSessionId: paymentInfo.sslSessionId,
        bankTransactionId: paymentInfo.bankTransactionId,
        cardType: paymentInfo.cardType,
        paymentGateway: paymentInfo.paymentGateway,
        paymentStatus: paymentInfo.method === 'cash_on_delivery' ? 'pending' : 'completed',
        paidAt: paymentInfo.method !== 'cash_on_delivery' ? new Date() : undefined,
        amount: totalAmount,
        currency: 'BDT'
      },
      subtotal,
      shippingCost,
      tax,
      discount,
      totalAmount,
      notes,
      orderStatus: 'pending',
      deliveryType: shippingAddress.deliveryType || 'standard',
      deliveryZone: shippingAddress.deliveryZone || 'inside_dhaka'
    });

    // Calculate estimated delivery
    newOrder.estimatedDelivery = newOrder.calculateEstimatedDelivery();

    await newOrder.save();

    // Populate the order with user details for response
    await newOrder.populate('user', 'name email');
    await newOrder.populate('items.product', 'title brand category');

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: newOrder._id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.orderStatus,
        totalAmount: newOrder.totalAmount,
        estimatedDelivery: newOrder.estimatedDelivery,
        createdAt: newOrder.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // 🔧 FIX: Use the correct user ID property
    const userId = (session.user as any).id || session.user.email;

    let orders;
    let totalOrders;

    // Check if user is admin
    const isAdmin = (session.user as any).role === 'admin';

    if (isAdmin) {
      // Admin can see all orders
      const query: any = {};
      if (status) query.orderStatus = status;

      orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'title brand category images stock')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      totalOrders = await Order.countDocuments(query);
    } else {
      // Regular user can only see their orders
      const query: any = { user: userId };
      if (status) query.orderStatus = status;

      orders = await Order.find(query)
        .populate('items.product', 'title brand category images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      totalOrders = await Order.countDocuments(query);
    }

    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        user: isAdmin ? order.user : undefined, // Only show user info to admin
        status: order.orderStatus,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentInfo: {
          method: order.paymentInfo.method,
          paymentStatus: order.paymentInfo.paymentStatus,
          paidAt: order.paymentInfo.paidAt,
          amount: order.paymentInfo.amount,
          currency: order.paymentInfo.currency
        },
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        discount: order.discount,
        totalAmount: order.totalAmount,
        deliveryType: order.deliveryType,
        deliveryZone: order.deliveryZone,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        trackingNumber: order.trackingNumber,
        courierService: order.courierService,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      isAdmin
    });

  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    }, { status: 500 });
  }
}