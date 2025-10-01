import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
     
      <main>
        {children}
      </main>
      <Toaster 
          position="top-center"
          reverseOrder={false}
        />
    </div>
  );
}