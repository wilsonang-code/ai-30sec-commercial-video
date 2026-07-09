import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/app/components/Nav";

export const metadata: Metadata = {
  title: "AI 30-Sec Commercial Video Generator",
  description: "Brief to client-accepted video, end-to-end.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <Nav />
        {children}
      </body>
    </html>
  );
}
