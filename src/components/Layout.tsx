"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex flex-col flex-1">
        <Topbar setIsOpen={setIsOpen} onMenuClick={function (): void {
          throw new Error("Function not implemented.");
        } } />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

