import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

// MongoDB client for NextAuth adapter
const client = new MongoClient(process.env.MONGODB_URI as string);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // ✅ Credentials login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await dbConnect();
          
          // Find user with password field
          const user = await (User as any).findOne({ email: credentials.email as string });
          
          if (!user) {
            throw new Error("No user found with the given email");
          }

          if (!user.password) {
            throw new Error("Invalid login method");
          }

          // Compare password using bcrypt
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // ✅ Return data that matches your schema
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
          } as any;
        } catch (error) {
          console.error("Authorization error:", error);
          throw error as any;
        }
      }
    }),

    // ✅ Google OAuth login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        }
      },
    }),
  ],

  session: {
    strategy: "database" as const, // Use database strategy with MongoDB adapter
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - how often to update the session
  },

  callbacks: {
    // Runs when a user signs in - Enhanced for MongoDB adapter
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log("SignIn callback:", { 
          provider: account?.provider, 
          userEmail: (user as any)?.email || (profile as any)?.email,
          accountType: account?.type,
          userId: user?.id 
        });

        // For Google OAuth, sync with your custom User model
        if (account?.provider === "google" && profile) {
          await dbConnect();
          
          const userEmail = (profile as any).email;
          console.log("Google OAuth user email:", userEmail);
          
          const existingUser = await (User as any).findOne({ email: userEmail });
          
          if (!existingUser) {
            console.log("Creating new user for Google OAuth:", userEmail);
            // ✅ Create user in your custom User model
            await (User as any).create({
              name: (profile as any).name || `${(profile as any).given_name || ''} ${(profile as any).family_name || ''}`.trim(),
              email: userEmail,
              role: "user",
            });
            console.log("New user created successfully in custom User model");
          } else {
            console.log("Existing user found for Google OAuth:", userEmail);
            // Update the NextAuth user record with role from custom model
            if (existingUser.role && user) {
              (user as any).role = existingUser.role;
            }
          }
        }

        // For credentials login, ensure user exists in both systems
        if (account?.provider === "credentials" && user?.email) {
          await dbConnect();
          
          const dbUser = await (User as any).findOne({ email: user.email });
          if (dbUser && user) {
            // Sync additional fields
            (user as any).role = dbUser.role || "user";
            (user as any).phone = dbUser.phone;
            console.log("Synced credentials user with custom model");
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        // Return false to redirect to error page
        return false;
      }
    },

    // ✅ Session callback for database strategy
    async session({ session, user }) {
      console.log("Session callback:", { session: !!session, user: !!user });
      
      if (user && session.user) {
        // With MongoDB adapter, user object comes from database
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role || "user";
        (session.user as any).phone = (user as any).phone;
        
        // Try to get additional user data from your custom User model
        try {
          await dbConnect();
          const dbUser = await (User as any).findOne({ email: session.user.email }).select("role _id email name phone");
          if (dbUser) {
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).role = dbUser.role || "user";
            (session.user as any).phone = dbUser.phone;
            console.log("Updated session with user data:", { 
              id: (session.user as any).id, 
              role: (session.user as any).role 
            });
          }
        } catch (error) {
          console.error("❌ Session Callback - DB lookup error:", error);
        }
      }
      
      return session;
    },

    // Handle redirects after sign in
    async redirect({ url, baseUrl }) {
      // Enhanced mobile-specific URL handling
      console.log("NextAuth redirect:", { url, baseUrl, userAgent: (global as any).currentRequest?.headers?.['user-agent'] });
      
      // Fix baseUrl if it's using wrong port
      let normalizedBaseUrl = baseUrl;
      if (baseUrl.includes('localhost:3000') && process.env.NEXTAUTH_URL?.includes('localhost:3001')) {
        normalizedBaseUrl = baseUrl.replace('localhost:3000', 'localhost:3001');
        console.log("Fixed baseUrl port:", normalizedBaseUrl);
      }
      normalizedBaseUrl = normalizedBaseUrl.endsWith('/') ? normalizedBaseUrl.slice(0, -1) : normalizedBaseUrl;
      
      // If url is relative, make it absolute
      if (url.startsWith("/")) {
        console.log("Relative URL detected, converting to absolute:", normalizedBaseUrl + url);
        return normalizedBaseUrl + url;
      }
      
      // Handle Google OAuth callback specifically
      if (url.includes('/api/auth/callback/google') || url.includes('accounts.google.com')) {
        console.log("Google OAuth callback/redirect detected:", url);
        
        // Check for error parameter first
        try {
          const urlObj = new URL(url);
          const error = urlObj.searchParams.get('error');
          if (error) {
            console.log("OAuth error detected:", error);
            if (error === 'access_denied') {
              return normalizedBaseUrl + '/authentication/login?error=access_denied';
            }
            return normalizedBaseUrl + '/authentication/error?error=' + error;
          }
          
          // Extract state parameter to get original callback URL
          const state = urlObj.searchParams.get('state');
          if (state) {
            try {
              const decodedState = decodeURIComponent(state);
              console.log("OAuth state parameter:", decodedState);
            } catch (e) {
              console.log("Could not decode state parameter:", e);
            }
          }
        } catch (e) {
          console.log("Could not parse OAuth URL:", e);
        }
        
        // For successful Google OAuth
        console.log("Successful Google OAuth detected");
        
        // Try to extract callback URL from referrer or state
        try {
          const urlObj = new URL(url);
          const callbackUrl = urlObj.searchParams.get('callbackUrl');
          if (callbackUrl) {
            const decodedCallbackUrl = decodeURIComponent(callbackUrl);
            if (decodedCallbackUrl.startsWith('/')) {
              console.log("Using callback URL from OAuth:", decodedCallbackUrl);
              return normalizedBaseUrl + decodedCallbackUrl;
            }
          }
        } catch (e) {
          console.log("Could not extract callback URL from OAuth:", e);
        }
        
        // Default to home page for successful Google OAuth
        console.log("Using default redirect to home");
        return normalizedBaseUrl + '/';
      }
      
      // Handle common mobile redirect issues
      if (url.includes('payemt-checkout') || url.includes('payment-checkout')) {
        return normalizedBaseUrl + '/cart?checkout=true';
      }
      
      // Handle callback URLs more robustly
      try {
        const parsedUrl = new URL(url);
        const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
        
        if (callbackUrl) {
          // Decode the callback URL if it's encoded
          const decodedCallbackUrl = decodeURIComponent(callbackUrl);
          
          // Ensure callback URL is safe and valid
          if (decodedCallbackUrl.startsWith('/')) {
            return normalizedBaseUrl + decodedCallbackUrl;
          }
          if (decodedCallbackUrl.startsWith(normalizedBaseUrl)) {
            return decodedCallbackUrl;
          }
          
          // If it's a valid relative path, use it
          if (!decodedCallbackUrl.includes('://') && !decodedCallbackUrl.startsWith('//')) {
            return normalizedBaseUrl + '/' + decodedCallbackUrl.replace(/^\/+/, '');
          }
        }
      } catch (e) {
        // Invalid URL, fallback to home
        console.error("Invalid redirect URL:", e);
      }
      
      // Handle same-origin URLs
      if (url.startsWith(normalizedBaseUrl)) {
        return url;
      }
      
      // Fallback to home page for safety
      return normalizedBaseUrl + '/';
    },
  },

  pages: {
    signIn: '/authentication/login',
    error: '/authentication/error',
    signOut: '/', // Redirect to home page after logout
  },

  // Enhanced configuration for production deployment with MongoDB sessions
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Proper domain handling for Vercel
        ...(process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL && {
          domain: `.${new URL(process.env.NEXTAUTH_URL).hostname.replace('www.', '')}`
        })
      }
    }
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };