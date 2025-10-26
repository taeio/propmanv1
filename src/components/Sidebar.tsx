"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, ClipboardList, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <AnimatePresence>
      {(isOpen || window.innerWidth >= 768) && (
        <motion.aside
          key="sidebar"
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          exit={{ x: -250 }}
          transition={{ duration: 0.25 }}
          className="fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col"
        >
          {/* Close button on mobile */}
          <div className="md:hidden flex justify-end p-3">
            <button
              className="p-2 rounded-lg hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 p-4">
            <SidebarItem icon={<Home />} label="Dashboard" />
            <SidebarItem icon={<Users />} label="Tenants" />
            <SidebarItem icon={<ClipboardList />} label="Maintenance" />
            <SidebarItem icon={<Settings />} label="Settings" />
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const SidebarItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
    {icon}
    <span>{label}</span>
  </button>
);

export default Sidebar;

