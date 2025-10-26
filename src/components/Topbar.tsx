"use client";
import React from "react";
import { Menu } from "lucide-react";

interface TopbarProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar: React.FC<TopbarProps> = ({ setIsOpen }) => {
  return (
    <header className="fixed md:static top-0 left-0 w-full md:w-auto z-50 bg-white shadow-md p-4 flex justify-between items-center">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="md:hidden text-gray-800 hover:text-columbia-700 transition"
      >
        <Menu size={28} />
      </button>
      <h1 className="text-lg font-semibold text-gray-800">PropMan Dashboard</h1>
    </header>
  );
};

export default Topbar;

