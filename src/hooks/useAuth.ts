// useAuth hook - provides user authentication state
// Reference: blueprint:javascript_log_in_with_replit
import { useState, useEffect } from "react";
import type { User } from "../../shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current user from API
    fetch("/api/auth/user")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Not authenticated");
      })
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
