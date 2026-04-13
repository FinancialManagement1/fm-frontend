import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

const fetchCategoriesFromAPI = async (token, type) => {
  if (!type) {
    throw new Error("type is required: must be 'income' or 'expense'");
  }

  const url = `${API_BASE_URL}/categories?type=${type}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data.items || [];
};

export function useCategories() {
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found. Please login.");
    return token;
  };

  const fetchIncomeCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const items = await fetchCategoriesFromAPI(token, "income");
      setIncomeCategories(items);
      return items;
    } catch (err) {
      console.error("fetchIncomeCategories error:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpenseCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const items = await fetchCategoriesFromAPI(token, "expense");
      setExpenseCategories(items);
      return items;
    } catch (err) {
      console.error("fetchExpenseCategories error:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();

      const [incomeItems, expenseItems] = await Promise.all([
        fetchCategoriesFromAPI(token, "income"),
        fetchCategoriesFromAPI(token, "expense"),
      ]);

      setIncomeCategories(incomeItems);
      setExpenseCategories(expenseItems);

      return { incomeItems, expenseItems };
    } catch (err) {
      console.error("fetchAllCategories error:", err);
      setError(err.message);
      return { incomeItems: [], expenseItems: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    incomeCategories,
    expenseCategories,
    loading,
    error,
    fetchIncomeCategories,
    fetchExpenseCategories,
    fetchAllCategories,
  };
}
