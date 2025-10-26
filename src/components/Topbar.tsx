"use client";
import React from "react";
import { Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>; // Add this here
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, setIsOpen }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-200"
        onClick={onMenuClick}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* App Title */}
      <h1 className="text-xl font-semibold text-gray-800">Property Dashboard</h1>

      {/* Placeholder Profile Circle */}
      <div className="w-8 h-8 bg-gray-300 rounded-full" />
    </header>
  );
};

export default Topbar;
