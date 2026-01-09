import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  selectedListingId: string | null;
  setSelectedListingId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "@takas_user";
const SELECTED_LISTING_KEY = "@takas_selected_listing";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedListingId = await AsyncStorage.getItem(SELECTED_LISTING_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedListingId) {
        setSelectedListingId(storedListingId);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string) => {
    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/login", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const { user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(SELECTED_LISTING_KEY);
      setUser(null);
      setSelectedListingId(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const handleSetSelectedListingId = async (id: string | null) => {
    setSelectedListingId(id);
    if (id) {
      await AsyncStorage.setItem(SELECTED_LISTING_KEY, id);
    } else {
      await AsyncStorage.removeItem(SELECTED_LISTING_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        selectedListingId,
        setSelectedListingId: handleSetSelectedListingId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
