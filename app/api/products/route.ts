import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import uploadImage from "@/middleware/multerStorage";
import { Product } from "@/models/products";

// GET - Fetch products
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    // Build query
    const query: any = {};
    
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();

    // Extract basic product data matching your schema
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;

    // Validate required fields according to your schema
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, price, category' },
        { status: 400 }
      );
    }

    // Handle image uploads
    let images: string[] = [];

    // Upload thumbnail
    const thumbnailFile = formData.get('thumbnail') as File;
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        const thumbnailUrl = await uploadImage(thumbnailFile);
        images.push(thumbnailUrl);
      } catch (error: any) {
        console.error('Error uploading thumbnail:', error);
        return NextResponse.json(
          { success: false, error: `Thumbnail upload failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    // Upload additional images
    const imageFiles = formData.getAll('images') as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await uploadImage(file);
          images.push(imageUrl);
        } catch (error: any) {
          console.error('Error uploading image:', error);
          return NextResponse.json(
            { success: false, error: `Image upload failed: ${error.message}` },
            { status: 400 }
          );
        }
      }
    }

    // Set default image if none provided
    if (images.length === 0) {
      images = [`https://via.placeholder.com/400x400?text=${encodeURIComponent(title)}`];
    }

    // Create product object matching your schema
    const productData = {
      title,
      description,
      price,
      category,
      brand: brand || 'Generic',
      images,
      stock,
      rating: 0
    };

    // Create and save product
    const product = new Product(productData);
    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}