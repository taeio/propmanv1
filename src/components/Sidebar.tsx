import React from "react";
import { useRouter } from "next/router";

const Sidebar: React.FC = () => {
  const router = useRouter();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Tenants", path: "/tenants" },
    { name: "Maintenance", path: "/maintenance" },
    { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-[#C4D8E2] text-gray-900 shadow-xl flex flex-col p-5">
      <h1 className="text-2xl font-bold text-[#C62828] mb-10">PropMan</h1>
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <button
            key={link.name}
            onClick={() => router.push(link.path)}
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
  );
};

export default Sidebar;
