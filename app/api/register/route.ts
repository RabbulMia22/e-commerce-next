import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse request body safely
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { firstName, lastName, email, phone, password, confirmPassword } = body;

    // 2️⃣ Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return new Response(JSON.stringify({ error: "All required fields must be filled" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Passwords do not match" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 3️⃣ Connect to DB
    await dbConnect();

    // 4️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Merge first + last name
    const fullName = `${firstName} ${lastName}`.trim();

    // 7️⃣ Create new user
    const newUser = await User.create({
      name: fullName,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: "user",
    });

    // 8️⃣ Create JWT token
    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 9️⃣ Set HttpOnly cookie
    const res = new Response(
      JSON.stringify({ message: "User registered successfully", user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

    res.headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict; Secure`
    );

    return res;

  } catch (err: any) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
