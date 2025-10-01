import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/models/products";
import uploadImage from "@/middleware/multerStorage";


export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock") === "true";
    const featured = searchParams.get("featured") === "true";

    // Build query object
    let query: any = {};

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock) {
      query.stock = { $gt: 0 };
    }

    if (featured) {
      query.rating = { $gte: 4 };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Debug logging
    console.log("API Query:", query);

    // Get total count
    const totalCount = await Product.countDocuments(query);

    // Fetch all products without pagination - Swiper will handle display
    const products = await Product.find(query)
      .sort({ createdAt: -1, _id: -1 });

    console.log("Products length:", products.length);
    console.log("Total count:", totalCount);

    return NextResponse.json({
      success: true,
      data: products,
      totalCount
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}


// POST - Create new product with image upload
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const formData = await request.formData();

    // Debug: Log all form data entries
    console.log('\n=== BACKEND RECEIVED ===');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log('========================\n');

    // Extract product data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceString = formData.get('price') as string;
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string || 'Generic';
    const stockString = formData.get('stock') as string;
    const ratingString = formData.get('rating') as string;

    // Validate required fields
    if (!title || !description || !priceString || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, price, and category are required' },
        { status: 400 }
      );
    }

    // Parse numeric values
    const price = parseFloat(priceString);
    const stock = parseInt(stockString) || 0;
    const rating = parseFloat(ratingString) || 4.0;

    // Validate numeric values
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (rating < 0 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 0 and 5' },
        { status: 400 }
      );
    }

    // Handle multiple image uploads - FIXED
    const images: string[] = [];
    
    // Method 1: Handle thumbnail
    const thumbnailFile = formData.get('thumbnail');
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      try {
        const imageUrl = await uploadImage(thumbnailFile);
        images.push(imageUrl);
        console.log('Thumbnail processed:', thumbnailFile.name);
      } catch (error: any) {
        console.error('[POST] Error uploading thumbnail:', error);
        return NextResponse.json(
          { success: false, error: `Thumbnail upload failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    // Method 2: Handle additional images with 'images' key (array approach)
    const additionalFiles = formData.getAll('images');
    console.log('Additional images found:', additionalFiles.length);
    
    for (const file of additionalFiles) {
      if (file instanceof File && file.size > 0) {
        try {
          const imageUrl = await uploadImage(file);
          images.push(imageUrl);
          console.log('Additional image processed:', file.name);
        } catch (error: any) {
          console.error('[POST] Error uploading additional image:', error);
          return NextResponse.json(
            { success: false, error: `Image upload failed: ${error.message}` },
            { status: 400 }
          );
        }
      }
    }

    // Method 3: Handle indexed images as backup (image_0, image_1, etc.)
    const imageCount = parseInt(formData.get('imageCount') as string) || 0;
    console.log('Image count from form:', imageCount);
    
    for (let i = 0; i < imageCount; i++) {
      const indexedFile = formData.get(`image_${i}`);
      if (indexedFile instanceof File && indexedFile.size > 0) {
        // Check if this image is already processed (avoid duplicates)
        const isAlreadyProcessed = additionalFiles.some(f => 
          f instanceof File && f.name === indexedFile.name && f.size === indexedFile.size
        );
        
        if (!isAlreadyProcessed) {
          try {
            const imageUrl = await uploadImage(indexedFile);
            images.push(imageUrl);
            console.log('Indexed image processed:', indexedFile.name);
          } catch (error: any) {
            console.error('[POST] Error uploading indexed image:', error);
            return NextResponse.json(
              { success: false, error: `Image upload failed: ${error.message}` },
              { status: 400 }
            );
          }
        }
      }
    }

    console.log('Total images processed:', images.length);

    // At least one image is required
    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one product image is required' },
        { status: 400 }
      );
    }

    // Create product object
    const productData = {
      title: title.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      brand: brand.trim(),
      images,
      stock,
      rating
    };

    console.log('Creating product with:', {
      ...productData,
      images: `${images.length} images`
    });

    // Create and save product
    const product = new Product(productData);
    const savedProduct = await product.save();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
      imageCount: images.length
    }, { status: 201 });

  } catch (error: any) {
    console.error('[POST] Error creating product:', error);

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

// PUT - Update existing product
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const productId = formData.get('id') as string;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for update' },
        { status: 400 }
      );
    }

    // Find existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Extract update data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceString = formData.get('price') as string;
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string;
    const stockString = formData.get('stock') as string;
    const ratingString = formData.get('rating') as string;

    // Build update object
    const updateData: any = {};

    // Update basic fields if provided
    if (title && title.trim()) {
      updateData.title = title.trim();
    }
    
    if (description && description.trim()) {
      updateData.description = description.trim();
    }

    if (category && category.trim()) {
      updateData.category = category.trim();
    }

    if (brand && brand.trim()) {
      updateData.brand = brand.trim();
    }

    // Handle numeric updates
    if (priceString) {
      const price = parseFloat(priceString);
      if (!isNaN(price) && price > 0) {
        updateData.price = price;
      }
    }

    if (stockString) {
      const stock = parseInt(stockString);
      if (!isNaN(stock) && stock >= 0) {
        updateData.stock = stock;
      }
    }

    if (ratingString) {
      const rating = parseFloat(ratingString);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        updateData.rating = rating;
      }
    }

    // Handle image uploads if new images provided
    const newImages: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image') && value instanceof File && value.size > 0) {
        try {
          const imageUrl = await uploadImage(value);
          newImages.push(imageUrl);
        } catch (error: any) {
          console.error('[PUT] Error uploading new image:', error);
          return NextResponse.json(
            { success: false, error: `Image upload failed: ${error.message}` },
            { status: 400 }
          );
        }
      }
    }

    // If new images uploaded, replace existing images
    if (newImages.length > 0) {
      updateData.images = newImages;
    }

    // Always update the updatedAt field
    updateData.updatedAt = new Date();

    // Perform update
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error: any) {
    console.error('[PUT] Error updating product:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for deletion' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });

  } catch (error: any) {
    console.error('[DELETE] Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}