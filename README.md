# 🛒 ShopMate - Modern E-Commerce Platform

**ShopMate** is a full-stack e-commerce platform built with Next.js, featuring secure payments, user authentication, and admin dashboard functionality.

## 🚀 Features

- **Modern UI/UX** with Tailwind CSS and Framer Motion animations
- **User Authentication** with NextAuth.js and Google OAuth
- **Product Management** with search and filtering capabilities
- **Shopping Cart** with persistent state management
- **Secure Payments** via SSLCommerz payment gateway
- **Admin Dashboard** for managing products, orders, and revenue
- **Responsive Design** optimized for all devices
- **Image Upload** with Cloudinary integration

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: SSLCommerz Payment Gateway
- **State Management**: Redux Toolkit with Zustand
- **Image Storage**: Cloudinary
- **Deployment**: Vercel

## � Environment Setup

Copy `.env.example` (or the snippets below) into a new `.env.local` for development and configure the same keys in your hosting provider for production:

```bash
MONGODB_URI=your-mongodb-uri
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generated-64-char-secret
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASS=...
NEXT_PUBLIC_BASE_URL=https://your-domain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> **Tip:** You can generate a strong `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

## �🏃‍♂️ Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses modern Next.js features including App Router, Server Components, and TypeScript for type safety.

## 🧱 Production Build

Before deploying, run a local production build to confirm everything compiles:

```bash
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to smoke-test the production bundle.

## ☁️ Deploying to Vercel

1. Push your code to GitHub.
2. Create a new Vercel project and import the repository.
3. Configure the Environment Variables in the Vercel dashboard using the values listed in the environment setup section.
4. Set the build command to `npm run build` and the output directory to `.next` (defaults).
5. Trigger a deployment; Vercel will build and host the project.
6. After the first deploy, add the production domain to your Google OAuth **Authorized redirect URIs** (e.g. `https://your-domain.com/api/auth/callback/google`).

For self-hosting, build with `npm run build` and serve with `npm run start` behind your preferred Node.js process manager.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Legal Policies (Public Links)

Google OAuth verification requires publicly accessible policy pages. You can review ours here:

- **Privacy Policy:** https://e-commerce-next-wine.vercel.app/privacy
- **Terms of Service:** https://e-commerce-next-wine.vercel.app/terms

Both endpoints are also available in the deployed application footer for easy access.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
