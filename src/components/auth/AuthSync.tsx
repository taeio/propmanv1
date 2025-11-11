"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAppStore } from "../../store/useAppStore";

export function AuthSync() {
  const { isAuthenticated } = useAuth();
  const { setAuthenticated, migrateLocalDataToDatabase, syncWithDatabase, loadProfile } = useAppStore();
  const prevAuthRef = useRef(isAuthenticated);
  const hasLoadedProfileRef = useRef(false);

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated && !wasAuthenticated) {
      setAuthenticated(true);
      migrateLocalDataToDatabase().then(() => {
        syncWithDatabase();
        loadProfile();
        hasLoadedProfileRef.current = true;
      });
    } else if (!isAuthenticated && wasAuthenticated) {
      setAuthenticated(false);
      hasLoadedProfileRef.current = false;
    } else if (isAuthenticated && !hasLoadedProfileRef.current) {
      setAuthenticated(true);
      loadProfile();
      hasLoadedProfileRef.current = true;
    }
  }, [isAuthenticated, setAuthenticated, migrateLocalDataToDatabase, syncWithDatabase, loadProfile]);

  return null;
}
