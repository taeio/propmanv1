"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, ClipboardList, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />

          {/* Sidebar itself */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="fixed left-0 top-0 z-50 h-full w-64 bg-gradient-to-b from-columbia-700 to-columbia-900 text-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-xl font-bold tracking-wide">PropMan</h2>
              <button onClick={toggleSidebar} className="text-gray-200 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-4">
              <a href="#" className="flex items-center gap-3 text-lg hover:text-silver transition">
                <Home className="w-5 h-5" /> Dashboard
              </a>
              <a href="#" className="flex items-center gap-3 text-lg hover:text-silver transition">
                <Users className="w-5 h-5" /> Tenants
              </a>
              <a href="#" className="flex items-center gap-3 text-lg hover:text-silver transition">
                <ClipboardList className="w-5 h-5" /> Maintenance
              </a>
              <a href="#" className="flex items-center gap-3 text-lg hover:text-silver transition">
                <Settings className="w-5 h-5" /> Settings
              </a>
            </nav>

            <footer className="p-4 text-xs text-center text-gray-400 border-t border-white/20">
              © 2025 PropMan. All rights reserved.
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;

