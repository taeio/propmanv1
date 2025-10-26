"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, ClipboardList, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const shouldShowSidebar = isOpen || (typeof window !== "undefined" && window.innerWidth >= 768);

  return (
    <AnimatePresence>
      {shouldShowSidebar && (
        <motion.aside
          key="sidebar"
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          exit={{ x: -250 }}
          transition={{ duration: 0.3 }}
          className="fixed md:static left-0 top-0 z-20 w-64 h-full bg-columbia-700 text-white shadow-lg flex flex-col"
        >
          <div className="flex justify-between items-center p-4 md:hidden">
            <h2 className="text-lg font-semibold">PropMan</h2>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="mt-4 space-y-2">
            <Link href="/" className="flex items-center px-4 py-2 hover:bg-columbia-900 transition">
              <Home className="mr-3 w-5 h-5" /> Dashboard
            </Link>
            <Link href="/tenants" className="flex items-center px-4 py-2 hover:bg-columbia-900 transition">
              <Users className="mr-3 w-5 h-5" /> Tenants
            </Link>
            <Link href="/tasks" className="flex items-center px-4 py-2 hover:bg-columbia-900 transition">
              <ClipboardList className="mr-3 w-5 h-5" /> Tasks
            </Link>
            <Link href="/settings" className="flex items-center px-4 py-2 hover:bg-columbia-900 transition">
              <Settings className="mr-3 w-5 h-5" /> Settings
            </Link>
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
