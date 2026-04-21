import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

// ── Helper: get auth headers ──
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found. Please login.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export function useBudget() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── GET /budgets?period=YYYY-MM ──
  // If no period given, backend defaults to current month
  const fetchBudget = useCallback(async (period) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();

      const url = period
        ? `${API_BASE_URL}/budgets?period=${period}`
        : `${API_BASE_URL}/budgets`;

      console.log("Fetching budget from:", url);

      const response = await fetch(url, { method: "GET", headers });
      const data = await response.json();

      console.log("Budget response:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch budget");
      }

      // ── Edge case: no budget set for this period ──
      if (data.limit === 0) {
        console.log("No budget set for this period — limit defaults to 0");
      }

      // ── Edge case: overspent ──
      if (data.spent > data.limit && data.limit > 0) {
        console.warn("User is over budget! Spent:", data.spent, "Limit:", data.limit);
      }

      setBudget(data);
      return data;
    } catch (err) {
      console.error("fetchBudget error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── POST /budgets ──
  // Creates or updates budget for a given period
  const saveBudget = useCallback(async (period, limit) => {
    setLoading(true);
    setError(null);
    try {
      // ── Edge case: limit must be > 0 ──
      if (!limit || limit <= 0) {
        throw new Error("Budget limit must be greater than 0");
      }

      // ── Edge case: period format must be YYYY-MM ──
      if (period && !/^\d{4}-\d{2}$/.test(period)) {
        throw new Error("Period must be in YYYY-MM format");
      }

      const headers = await getAuthHeaders();

      const body = period
        ? { period, limit }
        : { limit }; // backend defaults to current month

      console.log("Saving budget:", JSON.stringify(body));

      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      console.log("Save budget response:", JSON.stringify(data));

      // ── Edge case: limit less than current spending ──
      if (response.status === 400) {
        throw new Error(
          data.message || "Budget limit cannot be less than current spending"
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to save budget");
      }

      setBudget(data);
      return data;
    } catch (err) {
      console.error("saveBudget error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Derived values for UI ──
  const hasBudget = budget?.limit > 0;
  const isOverBudget = budget ? budget.spent > budget.limit && budget.limit > 0 : false;
  const progressPercentage = budget?.progressPercentage || 0;
  const remaining = budget?.remaining || 0;
  const spent = budget?.spent || 0;
  const limit = budget?.limit || 0;

  return {
    // ── State ──
    budget,
    loading,
    error,

    // ── Actions ──
    fetchBudget,
    saveBudget,

    // ── Derived values for UI (Pooja uses these directly) ──
    hasBudget,          // true if budget is set
    isOverBudget,       // true if spent > limit
    progressPercentage, // 0-100 for progress bar
    remaining,          // how much left
    spent,              // how much spent
    limit,              // budget limit
  };
}