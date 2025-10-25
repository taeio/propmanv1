import React from "react";
import { useRouter } from "next/router";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Tenants", path: "/tenants" },
    { name: "Maintenance", path: "/maintenance" },
    { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#C4D8E2] text-gray-900 shadow-xl flex flex-col p-5 transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h1
          className="text-2xl font-bold text-[#C62828] mb-10 cursor-pointer"
          onClick={() => router.push("/")}
        >
          PropMan
        </h1>
        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                router.push(link.path);
                toggleSidebar();
              }}
              className={`text-left px-3 py-2 rounded-lg transition ${
                router.pathname === link.path
                  ? "bg-[#C62828] text-white"
                  : "hover:bg-[#C0C0C0]"
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
