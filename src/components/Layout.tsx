import "./globals.css";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "PropMan",
  description: "Property management dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // keep sidebar open state here so it persists across route changes
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Topbar and Sidebar live here and will not be unmounted on route navigation */}
        <Topbar setIsOpen={setIsOpen} />
        <div className="flex">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          {/* main content reserved area (account for sidebar width on desktop) */}
          <main className="flex-1 min-h-screen md:ml-64">
            {/* children will be swapped while Topbar/Sidebar remain mounted */}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}