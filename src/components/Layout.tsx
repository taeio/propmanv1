"use client";
import React, { ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { AuthSync } from "./auth/AuthSync";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });
const Topbar = dynamic(() => import("./Topbar"), { ssr: false });

export default function Layout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useAuth();
  
  const userRole = user?.role || "property_manager";
  const showNavigation = !isLoading && userRole === "property_manager";
  
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AuthSync />
      
      {showNavigation && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}

      <div className="flex-1 flex flex-col">
        {showNavigation && <Topbar setIsOpen={setIsOpen} />}
        <main className={`p-6 ${showNavigation ? 'mt-16 md:mt-0' : ''}`}>{children}</main>
      </div>
    </div>
  );
}