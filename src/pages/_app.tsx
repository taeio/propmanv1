import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

export default function App({ Component, pageProps }: AppProps) {
  const { profile } = useAppStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || profile.themePreference;
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [profile.themePreference]);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}