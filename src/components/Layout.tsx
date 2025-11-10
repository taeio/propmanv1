"use client";
import React, { ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { AuthSync } from "./auth/AuthSync";

// Dynamically import the client components so they are only mounted on the client.
// This avoids server/client markup mismatch (hydration errors).
const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });
const Topbar = dynamic(() => import("./Topbar"), { ssr: false });

export default function Layout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Auth sync component - syncs auth state with store */}
      <AuthSync />
      
      {/* Sidebar (client-only) */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (client-only) */}
        <Topbar setIsOpen={setIsOpen} />
        <main className="p-6 mt-16 md:mt-0">{children}</main>
      </div>
    </div>
  );
}