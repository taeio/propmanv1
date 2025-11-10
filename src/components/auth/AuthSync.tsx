"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAppStore } from "../../store/useAppStore";

export function AuthSync() {
  const { isAuthenticated } = useAuth();
  const { setAuthenticated, migrateLocalDataToDatabase, syncWithDatabase } = useAppStore();
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated && !wasAuthenticated) {
      setAuthenticated(true);
      migrateLocalDataToDatabase().then(() => {
        syncWithDatabase();
      });
    } else if (!isAuthenticated && wasAuthenticated) {
      setAuthenticated(false);
    }
  }, [isAuthenticated, setAuthenticated, migrateLocalDataToDatabase, syncWithDatabase]);

  return null;
}
