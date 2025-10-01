import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="container mx-auto mt-4 mb-8">
                <Link href="/" className="flex-shrink-0 text-2xl font-bold text-white cursor-pointer bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-2 rounded-lg">
                    ShopMate
                </Link>
            </div>

            <main className="">

                {children}
            </main>

        </div>
    );
}