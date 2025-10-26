"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, ClipboardList, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Mobile close button */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 768) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white shadow-lg z-40 md:block"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-columbia-700">
                PropMan
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden text-gray-600 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-4 space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-columbia-700 hover:text-white transition"
              >
                <Home size={20} /> Dashboard
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-columbia-700 hover:text-white transition"
              >
                <Users size={20} /> Clients
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-columbia-700 hover:text-white transition"
              >
                <ClipboardList size={20} /> Projects
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-columbia-700 hover:text-white transition"
              >
                <Settings size={20} /> Settings
              </a>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      {isOpen && window.innerWidth < 768 && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;

