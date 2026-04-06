import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

// ── Fetch categories from API ──
const fetchCategoriesFromAPI = async (token, type) => {
  const url = type
    ? `${API_BASE_URL}/categories?type=${type}`
    : `${API_BASE_URL}/categories`;

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
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Get token ──
  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found. Please login.");
    return token;
  };

  // ── Fetch categories by type ──
  // type: "income" | "expense" | undefined (all)
  const fetchCategories = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const items = await fetchCategoriesFromAPI(token, type);

      if (type === "income") {
        setIncomeCategories(items);
      } else if (type === "expense") {
        setExpenseCategories(items);
      } else {
        setAllCategories(items);
        // ── Also split by type ──
        setIncomeCategories(items.filter((i) => i.type === "income"));
        setExpenseCategories(items.filter((i) => i.type === "expense"));
      }

      return items;
    } catch (err) {
      console.error("fetchCategories error:", err);
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

      setIncomeCategories(incomeItems);
      setExpenseCategories(expenseItems);
      setAllCategories([...incomeItems, ...expenseItems]);

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
    // ── State ──
    incomeCategories,
    expenseCategories,
    allCategories,
    loading,
    error,

    // ── Actions ──
    fetchCategories,
    fetchAllCategories,
  };
}