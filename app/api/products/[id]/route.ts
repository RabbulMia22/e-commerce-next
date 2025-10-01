import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product } from "@/models/products";
import uploadImage from "@/middleware/multerStorage";

// GET - Fetch single product by ID


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing product ID' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}


// PUT - Update single product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    // Validate MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Find existing product
    const existingProduct = await Product.findById(id);
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

    const updateData: any = {};

    // Update basic fields if provided
    if (title && title.trim()) updateData.title = title.trim();
    if (description && description.trim()) updateData.description = description.trim();
    if (category && category.trim()) updateData.category = category.trim();
    if (brand && brand.trim()) updateData.brand = brand.trim();

    // Handle numeric updates with validation
    if (priceString) {
      const price = parseFloat(priceString);
      if (!isNaN(price) && price > 0) {
        updateData.price = price;
      } else {
        return NextResponse.json(
          { success: false, error: 'Price must be a positive number' },
          { status: 400 }
        );
      }
    }

    if (stockString) {
      const stock = parseInt(stockString);
      if (!isNaN(stock) && stock >= 0) {
        updateData.stock = stock;
      } else {
        return NextResponse.json(
          { success: false, error: 'Stock must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (ratingString) {
      const rating = parseFloat(ratingString);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        updateData.rating = rating;
      } else {
        return NextResponse.json(
          { success: false, error: 'Rating must be between 0 and 5' },
          { status: 400 }
        );
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
          console.error('Error uploading new image:', error);
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

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
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
    console.error('Error updating product:', error);

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

// DELETE - Delete single product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    // Validate MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}