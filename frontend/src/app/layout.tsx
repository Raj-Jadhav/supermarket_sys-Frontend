import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SMMS - Supermarket Management System',
  description: 'Manage inventory, aisles, and products with smart business logic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}