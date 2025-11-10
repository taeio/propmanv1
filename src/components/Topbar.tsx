"use client";
import React from "react";
import { Menu, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface TopbarProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar: React.FC<TopbarProps> = ({ setIsOpen }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <header className="fixed md:static top-0 left-0 w-full md:w-auto z-50 bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-gray-800 hover:text-columbia-700 transition"
        >
          <Menu size={28} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">PropMan Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : isAuthenticated && user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
              <User size={16} />
              <span>{user.username}</span>
            </div>
            <a
              href="/api/auth/logout"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </a>
          </>
        ) : (
          <a
            href="/api/auth/login"
            className="flex items-center gap-2 px-4 py-2 bg-columbia-600 hover:bg-columbia-700 text-white rounded-lg transition text-sm"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Login</span>
          </a>
        )}
      </div>
    </header>
  );
};

export default Topbar;

