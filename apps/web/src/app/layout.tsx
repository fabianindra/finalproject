import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/common/Footer';
import { Providers } from './providers';
import Nav from '@/components/common/Nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resthere',
  description: 'Property Renting App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Nav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
