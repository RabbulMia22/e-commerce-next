import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
     
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      
      <Toaster 
          position="top-center"
          reverseOrder={false}
        />
    </div>
  );
}