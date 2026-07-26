import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITRA Throughput Tracker",
  description: "R2v3 Throughput Tracking for IT Recycling Answers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
