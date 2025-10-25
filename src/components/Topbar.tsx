import React from "react";

const Topbar: React.FC = () => {
  return (
    <header className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-[#C62828]">Dashboard</h2>
      <div className="flex items-center gap-4">
        <button className="bg-[#C62828] text-white px-3 py-1 rounded-lg hover:opacity-90">
          + New
        </button>
        <div className="w-10 h-10 bg-[#C4D8E2] rounded-full border border-[#C0C0C0]" />
      </div>
    </header>
  );
};

export default Topbar;
