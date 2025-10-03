import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists with email
    const existingUserByEmail = await (User as any).findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User already exists with this email address' },
        { status: 409 }
      );
    }

    // Check if user already exists with phone (if phone is provided)
    if (phone && phone.trim()) {
      const existingUserByPhone = await (User as any).findOne({ phone: phone.trim() });
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'User already exists with this phone number' },
          { status: 409 }
        );
      }
    }

    // ✅ Create user with the correct schema fields
    const newUser = new User({
      name: `${firstName.trim()} ${lastName.trim()}`, // Combine into single name field
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      password: password, 
      role: 'user',
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    };

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const duplicateField = error.keyValue;
      
      if (duplicateField.email) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please try logging in instead.' },
          { status: 409 }
        );
      }
      
      if (duplicateField.phone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists. Please try logging in instead.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'An account with these details already exists. Please try logging in instead.' },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}