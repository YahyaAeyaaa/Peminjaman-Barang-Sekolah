import './globals.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Next.js with Three.js',
  description: 'Next.js project with Three.js integration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

