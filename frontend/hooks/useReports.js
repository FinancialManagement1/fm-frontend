// Abir's Logic - useReports.js
// NO UI - Only data fetching

import { useState, useCallback } from "react";
import { reportService } from "../services/reportService";

export function useReports() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (period) => {
    setLoading(true);
    setError(null);
    try {
      if (!/^\d{4}-\d{2}$/.test(period)) {
        throw new Error("Period must be in YYYY-MM format");
      }
      const data = await reportService.getSummary(period);
      setSummary(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (period) => {
    setLoading(true);
    setError(null);
    try {
      if (!/^\d{4}-\d{2}$/.test(period)) {
        throw new Error("Period must be in YYYY-MM format");
      }
      const data = await reportService.getTrends(period);
      setTrends(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (period) => {
    console.log("🔄 fetchCategories called with period:", period);
    setLoading(true);
    setError(null);
    try {
      if (!/^\d{4}-\d{2}$/.test(period)) {
        throw new Error("Period must be in YYYY-MM format");
      }
      const data = await reportService.getCategories(period);
      console.log("✅ Categories fetched for", period, ":", JSON.stringify(data));
      setCategories(data);
      return data;
    } catch (err) {
      console.error("❌ fetchCategories error:", err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllReports = useCallback(async (period) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, trendsData, categoriesData] = await Promise.all([
        reportService.getSummary(period),
        reportService.getTrends(period),
        reportService.getCategories(period),
      ]);
      setSummary(summaryData);
      setTrends(trendsData);
      setCategories(categoriesData);
      return { summary: summaryData, trends: trendsData, categories: categoriesData };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    trends,
    categories,
    loading,
    error,
    fetchSummary,
    fetchTrends,
    fetchCategories,
    fetchAllReports,
    income: summary?.income || 0,
    expenses: summary?.expenses || 0,
    balance: summary?.balance || 0,
    trendItems: trends?.items || [],
    categoryItems: categories?.items || categories || [],
  };
}
