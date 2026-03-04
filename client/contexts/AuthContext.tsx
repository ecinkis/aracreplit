import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  sendCode: (phone: string) => Promise<void>;
  verifyAndLogin: (phone: string, code: string, name?: string) => Promise<void>;
  loginWithApple: (appleId: string, email?: string, fullName?: string, identityToken?: string) => Promise<void>;
  loginWithGoogle: (googleId: string, email?: string, name?: string, photo?: string, accessToken?: string) => Promise<void>;
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
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          const { getApiUrl } = await import("@/lib/query-client");
          const response = await fetch(new URL(`/api/users/${parsedUser.id}`, getApiUrl()).toString());
          if (response.ok) {
            const freshUser = await response.json();
            setUser(freshUser);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
          }
        } catch (refreshError) {
          // ignore
        }
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

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/login-email", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Giriş başarısız");
      }

      const { user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Login email error:", error);
      throw error;
    }
  };

  const sendCode = async (phone: string) => {
    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/send-code", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "SMS gonderilemedi");
      }
    } catch (error) {
      console.error("Send code error:", error);
      throw error;
    }
  };

  const verifyAndLogin = async (phone: string, code: string, name?: string) => {
    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/verify-code", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Dogrulama hatasi");
      }

      const { user: loggedInUser } = await response.json();
      
      if (name) {
        const updateResponse = await fetch(new URL(`/api/users/${loggedInUser.id}`, getApiUrl()).toString(), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (updateResponse.ok) {
          const updatedUser = await updateResponse.json();
          setUser(updatedUser);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          return;
        }
      }
      
      setUser(loggedInUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Verify and login error:", error);
      throw error;
    }
  };

  const loginWithApple = async (appleId: string, email?: string, fullName?: string, identityToken?: string) => {
    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/apple", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appleId, email, fullName, identityToken }),
      });

      if (!response.ok) {
        throw new Error("Apple login failed");
      }

      const { user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Apple login error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (googleId: string, email?: string, name?: string, photo?: string, accessToken?: string) => {
    try {
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/google", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, googleId, email, name, photo }),
      });

      if (!response.ok) {
        throw new Error("Google login failed");
      }

      const { user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS !== "web") {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: undefined });
          if (tokenData?.data) {
            const { getApiUrl } = await import("@/lib/query-client");
            await fetch(new URL("/api/push-token", getApiUrl()).toString(), {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: tokenData.data }),
            });
          }
        } catch (tokenError) {
          // ignore
        }
      }
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
        loginWithEmail,
        sendCode,
        verifyAndLogin,
        loginWithApple,
        loginWithGoogle,
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
