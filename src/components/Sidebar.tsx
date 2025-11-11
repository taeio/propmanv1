"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, ClipboardList, Settings, DollarSign, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) return null;

  const links = [
    { name: "Dashboard", href: "/", icon: <Home size={20} /> },
    { name: "Clients", href: "/clients", icon: <Users size={20} /> },
    { name: "Projects", href: "/projects", icon: <ClipboardList size={20} /> },
    { name: "Finance", href: "/finance", icon: <DollarSign size={20} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      <AnimatePresence>
        {(isOpen || windowWidth >= 768) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white dark:bg-gray-800 shadow-lg z-40 md:block"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-columbia-700 dark:text-gray-200">
                PropMan
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-4 space-y-3">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-columbia-700 hover:text-white dark:hover:bg-gray-700 transition"
                  onClick={() => {
                    if (windowWidth < 768) setIsOpen(false);
                  }}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      {isOpen && windowWidth < 768 && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
