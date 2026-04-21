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
