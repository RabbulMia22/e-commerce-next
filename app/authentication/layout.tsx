import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <div className="container mx-auto mt-4 mb-8">
            <Link href="/" className="flex-shrink-0 text-2xl font-bold text-white cursor-pointer bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-2 rounded-lg">
            ShopMate
         </Link>
        </div>
        <div className=" flex items-center justify-center bg-gray-50">
      <main className="w-full max-w-md p-8 bg-white shadow-md rounded">
        
        {children}
      </main>
    </div>
    </div>
  );
}