import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Happy Hackers Clubs | LMS',
  description: 'From Zero to Hero, Happy Hackers Make Coding a Blast.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark text-white antialiased`}>
        {/* We can place generic layout things like Navigation here */}
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
