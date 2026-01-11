import './globals.css';

export const metadata = {
  title: 'Next.js with Three.js',
  description: 'Next.js project with Three.js integration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f2f2ed]">{children}</body>
    </html>
  );
}

