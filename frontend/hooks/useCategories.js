import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

// ── Fetch categories from API (type is REQUIRED) ──
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

// ── useCategories hook ──
export function useCategories() {
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Get token ──
  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found. Please login.");
    return token;
  };

  // ── Fetch income categories ──
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

  // ── Fetch expense categories ──
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

  // ── Fetch both income and expense categories ──
  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();

      const [incomeItems, expenseItems] = await Promise.all([
        fetchCategoriesFromAPI(token, "income"),
        fetchCategoriesFromAPI(token, "expense"),
      ]);

      // ── Filter by type since backend may return all categories ──
      const filteredIncome = incomeItems.filter((c) => c.type === "income");
      const filteredExpense = expenseItems.filter((c) => c.type === "expense");

      setIncomeCategories(filteredIncome);
      setExpenseCategories(filteredExpense);

      return { incomeItems: filteredIncome, expenseItems: filteredExpense };
    } catch (err) {
      console.error("fetchAllCategories error:", err);
      setError(err.message);
      return { incomeItems: [], expenseItems: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // ── State ──
    incomeCategories,
    expenseCategories,
    loading,
    error,

    // ── Actions ──
    fetchIncomeCategories,
    fetchExpenseCategories,
    fetchAllCategories,
  };
}