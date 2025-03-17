import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A Next.js blog platform with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-6">
              <div className="container mx-auto px-4 text-center">
                <p>
                  © {new Date().getFullYear()} Blog Platform. All rights
                  reserved.
                </p>
              </div>
            </footer>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
