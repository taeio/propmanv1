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
    <header className="fixed md:static top-0 left-0 w-full md:w-auto z-50 bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden text-gray-800 dark:text-gray-100 hover:text-columbia-700 dark:hover:text-columbia-500 transition"
        >
          <Menu size={28} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">PropMan Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        ) : isAuthenticated && user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <User size={16} />
              <span>{user.username}</span>
            </div>
            <a
              href="/api/auth/logout"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg transition text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </a>
          </>
        ) : (
          <a
            href="/auth"
            className="flex items-center gap-2 px-4 py-2 bg-columbia-600 hover:bg-columbia-700 dark:bg-columbia-700 dark:hover:bg-columbia-600 text-white rounded-lg transition text-sm"
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

