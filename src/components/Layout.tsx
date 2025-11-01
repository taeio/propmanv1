import React, { ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import the client components so they are only mounted on the client.
// This avoids server/client markup mismatch (hydration errors).
const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });
const Topbar = dynamic(() => import("./Topbar"), { ssr: false });

export default function Layout({ children }: { children: ReactNode }) {
  // Keep layout as a server component — client-only pieces are dynamically mounted.
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (client-only) */}
      <Sidebar isOpen={false} setIsOpen={() => {}} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (client-only) */}
        <Topbar setIsOpen={() => {}} />
        <main className="p-6 mt-16 md:mt-0">{children}</main>
      </div>
    </div>
  );
}