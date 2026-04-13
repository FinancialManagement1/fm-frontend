import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Token helpers ──
const TOKEN_KEY = "token";

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const getToken = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
};

export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

// ── useAuth hook ──
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Logout function ──
  // Pooja calls this from UI: const { logout } = useAuth();
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await removeToken();
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Check if logged in ──
  const isAuthenticated = async () => {
    const token = await getToken();
    return !!token;
  };

  return {
    loading,
    error,
    logout,
    isAuthenticated,
    getToken,
    saveToken,
    removeToken,
  };
}