import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { BannerOffer } from "@/models/bannerOffer";
import uploadImage from "@/middleware/multerStorage";

// GET - Fetch all banners
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    // Build query
    const query = activeOnly ? { isActive: true } : {};
    
    const banners = await BannerOffer.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: banners,
      count: banners.length
    });

  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();

    // Extract banner data
    const title = formData.get('title') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const isActive = formData.get('isActive') === 'true';

    // Validate required fields
    if (!title || !linkUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title and linkUrl are required' },
        { status: 400 }
      );
    }

    // Handle image upload
    const imageFile = formData.get('image') as File;
    let imageUrl = '';

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (error: any) {
        console.error('Error uploading banner image:', error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Banner image is required' },
        { status: 400 }
      );
    }

    // Create banner object
    const bannerData = {
      title,
      imageUrl,
      linkUrl,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create and save banner
    const banner = new BannerOffer(bannerData);
    await banner.save();

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating banner:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PUT - Update existing banner
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const bannerId = formData.get('id') as string;

    if (!bannerId) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required for update' },
        { status: 400 }
      );
    }

    // Find existing banner
    const existingBanner = await BannerOffer.findById(bannerId);
    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Extract update data
    const title = formData.get('title') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const isActive = formData.get('isActive');

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title;
    if (linkUrl) updateData.linkUrl = linkUrl;
    if (isActive !== null) updateData.isActive = isActive === 'true';

    // Handle image update
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      try {
        updateData.imageUrl = await uploadImage(imageFile);
      } catch (error: any) {
        console.error('Error uploading new banner image:', error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    // Update banner
    const updatedBanner = await BannerOffer.findByIdAndUpdate(
      bannerId,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedBanner
    });

  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bannerId = searchParams.get('id');

    if (!bannerId) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const deletedBanner = await BannerOffer.findByIdAndDelete(bannerId);
    
    if (!deletedBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      data: deletedBanner
    });

  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}