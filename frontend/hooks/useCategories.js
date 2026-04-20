import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

const fetchCategoriesFromAPI = async (token, type) => {
  if (!type) {
    throw new Error("type is required: must be 'income' or 'expense'");
  }

  const url = `${API_BASE_URL}/categories?type=${type}`;
  console.log("Fetching categories from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Categories [${type}] status:`, response.status);

  const data = await response.json();
  console.log(`Categories [${type}] response:`, JSON.stringify(data));

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
      const filtered = items.filter((c) => c.type === "income");
      console.log("Income categories loaded:", filtered.length);
      setIncomeCategories(filtered);
      return filtered;
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
      const filtered = items.filter((c) => c.type === "expense");
      console.log("Expense categories loaded:", filtered.length);
      setExpenseCategories(filtered);
      return filtered;
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

      const incomeItems = await fetchCategoriesFromAPI(token, "income");
      const expenseItems = await fetchCategoriesFromAPI(token, "expense");

      // ── Filter by type since backend returns all categories ──
      const filteredIncome = incomeItems.filter((c) => c.type === "income");
      const filteredExpense = expenseItems.filter((c) => c.type === "expense");

      console.log("Filtered income:", filteredIncome.length, filteredIncome);
      console.log("Filtered expense:", filteredExpense.length, filteredExpense);

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
    incomeCategories,
    expenseCategories,
    loading,
    error,
    fetchIncomeCategories,
    fetchExpenseCategories,
    fetchAllCategories,
  };
}