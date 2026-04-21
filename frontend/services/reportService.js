// Abir's Logic - reportService.js
// NO UI - Only API calls

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const reportService = {
  // GET /reports/summary?period=YYYY-MM
  getSummary: async (period) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/reports/summary?period=${period}`, {
      method: "GET",
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch summary");
    return data;
  },

  // GET /reports/trends?period=YYYY-MM
  // Returns cumulative data
  getTrends: async (period) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/reports/trends?period=${period}`, {
      method: "GET",
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch trends");
    return data;
  },
};
