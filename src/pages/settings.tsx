"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cog } from "lucide-react";
import Layout from "@/components/Layout";

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState({ name: "John Doe", email: "john@email.com" });
  const [theme, setTheme] = useState("light");
  const [apiKey, setApiKey] = useState("sk-XXXX");

  return (
    <Layout>
      <div className="p-6 space-y-8 max-w-lg mx-auto">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold flex items-center gap-3 text-gray-800"
        >
          <Cog className="w-7 h-7" />
          Settings
        </motion.h1>
        {/* User info */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
          <input
            className="w-full border rounded mb-2 px-3 py-2"
            value={userInfo.name}
            onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
            placeholder="Name"
          />
          <input
            className="w-full border rounded mb-2 px-3 py-2"
            value={userInfo.email}
            onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
            placeholder="Email"
          />
          {/* Theme selector */}
          <label className="block mb-2">Theme Preference</label>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          {/* API Key */}
          <label className="block mb-2">API Key</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Paste your API key"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl mt-3 hover:bg-blue-700 transition">Save Changes</button>
        </div>
      </div>
    </Layout>
  );
}
