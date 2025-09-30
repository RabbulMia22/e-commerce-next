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

    console.log('[GET] Fetched banners:', banners.length);

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

    // Debug: Log all FormData entries
    console.log('[POST] FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value, typeof value);
    }
    
    // Check specifically for date fields
    console.log('[POST] FormData has startDate:', formData.has('startDate'));
    console.log('[POST] FormData has endDate:', formData.has('endDate'));

    // Extract banner data
    const title = formData.get('title') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const discountString = formData.get('discount') as string;
    const isActive = formData.get('isActive') === 'true';
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    console.log('[POST] Raw formData startDate:', startDate, typeof startDate);
    console.log('[POST] Raw formData endDate:', endDate, typeof endDate);
    console.log('[POST] Raw formData discount:', discountString, typeof discountString);
    
    // Parse discount with validation
    let discount: number | undefined = undefined;
    
    if (discountString && discountString.trim() !== '' && discountString !== 'null' && discountString !== 'undefined') {
      const parsed = parseFloat(discountString);
      discount = !isNaN(parsed) ? parsed : undefined;
    }
    
    console.log('[POST] Parsed discount:', discount, typeof discount);

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
    const bannerData: any = {
      title,
      imageUrl,
      linkUrl,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add dates only if they are valid
    if (startDate && startDate.trim() !== '' && startDate !== 'null' && startDate !== 'undefined') {
      bannerData.startDate = new Date(startDate);
      console.log('[POST] Added startDate:', bannerData.startDate);
    } else {
      console.log('[POST] No valid startDate provided:', startDate);
    }

    if (endDate && endDate.trim() !== '' && endDate !== 'null' && endDate !== 'undefined') {
      bannerData.endDate = new Date(endDate);
      console.log('[POST] Added endDate:', bannerData.endDate);
    } else {
      console.log('[POST] No valid endDate provided:', endDate);
    }

    // Add discount if provided
    if (discount !== undefined) {
      bannerData.discount = discount;
      console.log('[POST] Added discount to bannerData:', discount);
    } else {
      console.log('[POST] No discount to add - discount was undefined');
    }

    console.log('[POST] Banner data object:', JSON.stringify(bannerData, null, 2));

    // Create and save banner
    const banner = new BannerOffer(bannerData);
    const savedBanner = await banner.save();

    console.log('[POST] Saved banner to database:', JSON.stringify(savedBanner, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
      data: savedBanner
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

    console.log('[PUT] Update request for banner ID:', bannerId);

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
    const isActive = formData.get('isActive');
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    console.log('[PUT] Raw formData startDate:', startDate, typeof startDate);
    console.log('[PUT] Raw formData endDate:', endDate, typeof endDate);
    console.log('[PUT] Raw formData discount:', discountString, typeof discountString);
    
    // Parse discount with validation
    let discount: number | undefined = undefined;
    if (discountString && discountString.trim() !== '' && discountString !== 'null' && discountString !== 'undefined') {
      const parsed = parseFloat(discountString);
      discount = !isNaN(parsed) ? parsed : undefined;
    }
    
    console.log('[PUT] Parsed discount for update:', discount, typeof discount);

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title;
    if (linkUrl) updateData.linkUrl = linkUrl;
    if (discount !== undefined) updateData.discount = discount;
    if (isActive !== null) updateData.isActive = isActive === 'true';
    if (startDate && startDate.trim() !== '' && startDate !== 'null' && startDate !== 'undefined') {
      updateData.startDate = new Date(startDate);
      console.log('[PUT] Added startDate to updateData:', updateData.startDate);
    } else {
      console.log('[PUT] No valid startDate provided for update:', startDate);
    }
    
    if (endDate && endDate.trim() !== '' && endDate !== 'null' && endDate !== 'undefined') {
      updateData.endDate = new Date(endDate);
      console.log('[PUT] Added endDate to updateData:', updateData.endDate);
    } else {
      console.log('[PUT] No valid endDate provided for update:', endDate);
    }
    
    console.log('[PUT] Update data object:', JSON.stringify(updateData, null, 2));

    // Handle image update
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      try {
        updateData.imageUrl = await uploadImage(imageFile);
        console.log('[PUT] New image uploaded:', updateData.imageUrl);
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

    console.log('[PUT] Updated banner in database:', JSON.stringify(updatedBanner, null, 2));

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

    console.log('[DELETE] Delete request for banner ID:', bannerId);

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

    console.log('[DELETE] Deleted banner:', JSON.stringify(deletedBanner, null, 2));

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
