import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { BannerOffer } from "@/models/bannerOffer";
import uploadImage from "@/middleware/multerStorage";

// GET - Fetch all banners or filter by active status
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const currentOnly = searchParams.get('current') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    
    if (activeOnly) {
      query.isActive = true;
    }

    if (currentOnly) {
      // Get banners that are currently active based on dates
      const now = new Date();
      query.isActive = true;
      query.$or = [
        // No date restrictions
        { startDate: { $exists: false }, endDate: { $exists: false } },
        // Within date range
        {
          $and: [
            { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
            { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
          ]
        }
      ];
    }
    
    // Execute query with pagination
    const banners = await BannerOffer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await BannerOffer.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: banners,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
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
    const discountString = formData.get('discount') as string;
    const isActive = formData.get('isActive') === 'true';
    const startDateString = formData.get('startDate') as string;
    const endDateString = formData.get('endDate') as string;

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
        console.error('[POST] Error uploading banner image:', error);
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
    const bannerData: any = {
      title: title.trim(),
      imageUrl,
      linkUrl: linkUrl.trim(),
      isActive: isActive !== undefined ? isActive : true
    };

    // Parse and add discount if provided
    if (discountString && discountString.trim() !== '' && discountString !== 'null' && discountString !== 'undefined') {
      const discount = parseFloat(discountString);
      if (!isNaN(discount) && discount >= 0 && discount <= 100) {
        bannerData.discount = discount;
      }
    }

    // Parse and add dates if provided
    if (startDateString && startDateString.trim() !== '' && startDateString !== 'null' && startDateString !== 'undefined') {
      try {
        const startDate = new Date(startDateString);
        if (!isNaN(startDate.getTime())) {
          bannerData.startDate = startDate;
        }
      } catch (error) {
        // Invalid date format - skip
      }
    }

    if (endDateString && endDateString.trim() !== '' && endDateString !== 'null' && endDateString !== 'undefined') {
      try {
        const endDate = new Date(endDateString);
        if (!isNaN(endDate.getTime())) {
          bannerData.endDate = endDate;
        }
      } catch (error) {
        // Invalid date format - skip
      }
    }

    // Validate date logic
    if (bannerData.startDate && bannerData.endDate && bannerData.startDate >= bannerData.endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Create and save banner
    const banner = new BannerOffer(bannerData);
    const savedBanner = await banner.save();

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
      data: savedBanner
    }, { status: 201 });

  } catch (error: any) {
    console.error('[POST] Error creating banner:', error);

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
    const discountString = formData.get('discount') as string;
    const isActiveString = formData.get('isActive') as string;
    const startDateString = formData.get('startDate') as string;
    const endDateString = formData.get('endDate') as string;

    // Build update object
    const updateData: any = {};

    // Update basic fields if provided
    if (title && title.trim()) {
      updateData.title = title.trim();
    }
    
    if (linkUrl && linkUrl.trim()) {
      updateData.linkUrl = linkUrl.trim();
    }

    if (isActiveString !== null && isActiveString !== undefined) {
      updateData.isActive = isActiveString === 'true';
    };

    // Handle discount update
    if (discountString !== null && discountString !== undefined) {
      if (discountString === '' || discountString === 'null' || discountString === 'undefined') {
        updateData.$unset = { discount: 1 };
      } else {
        const discount = parseFloat(discountString);
        if (!isNaN(discount) && discount >= 0 && discount <= 100) {
          updateData.discount = discount;
        }
      }
    }

    // Handle date updates
    if (startDateString !== null && startDateString !== undefined) {
      if (startDateString === '' || startDateString === 'null' || startDateString === 'undefined') {
        if (!updateData.$unset) updateData.$unset = {};
        updateData.$unset.startDate = 1;
      } else {
        try {
          const startDate = new Date(startDateString);
          if (!isNaN(startDate.getTime())) {
            updateData.startDate = startDate;
          }
        } catch (error) {
          // Invalid date format - skip
        }
      }
    }

    if (endDateString !== null && endDateString !== undefined) {
      if (endDateString === '' || endDateString === 'null' || endDateString === 'undefined') {
        if (!updateData.$unset) updateData.$unset = {};
        updateData.$unset.endDate = 1;
      } else {
        try {
          const endDate = new Date(endDateString);
          if (!isNaN(endDate.getTime())) {
            updateData.endDate = endDate;
          }
        } catch (error) {
          // Invalid date format - skip
        }
      }
    }

    // Handle image upload if new image provided
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const newImageUrl = await uploadImage(imageFile);
        updateData.imageUrl = newImageUrl;
      } catch (error: any) {
        console.error('[PUT] Error uploading new image:', error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    // Validate date logic if both dates are being updated
    const finalStartDate = updateData.startDate || existingBanner.startDate;
    const finalEndDate = updateData.endDate || existingBanner.endDate;
    
    if (finalStartDate && finalEndDate && finalStartDate >= finalEndDate) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Always update the updatedAt field
    updateData.updatedAt = new Date();

    // Perform update
    const updatedBanner = await BannerOffer.findByIdAndUpdate(
      bannerId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return NextResponse.json(
        { success: false, error: 'Failed to update banner' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedBanner
    });

  } catch (error: any) {
    console.error('[PUT] Error updating banner:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Banner ID is required for deletion' },
        { status: 400 }
      );
    }

    // Check if banner exists
    const existingBanner = await BannerOffer.findById(bannerId);
    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Delete the banner
    const deletedBanner = await BannerOffer.findByIdAndDelete(bannerId);

    if (!deletedBanner) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete banner' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      data: deletedBanner
    });

  } catch (error: any) {
    console.error('[DELETE] Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}