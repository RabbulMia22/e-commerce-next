import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Banner />
      <main>
        {children}
      </main>
    </div>
  );
}