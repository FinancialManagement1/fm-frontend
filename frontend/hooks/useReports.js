// Abir's Logic - useReports.js
// NO UI - Only data fetching

import { useState, useCallback } from "react";
import { reportService } from "../services/reportService";

export function useReports() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
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

  const fetchAllReports = useCallback(async (period) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, trendsData] = await Promise.all([
        reportService.getSummary(period),
        reportService.getTrends(period),
      ]);
      setSummary(summaryData);
      setTrends(trendsData);
      return { summary: summaryData, trends: trendsData };
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
    loading,
    error,
    fetchSummary,
    fetchTrends,
    fetchAllReports,
    income: summary?.income || 0,
    expenses: summary?.expenses || 0,
    balance: summary?.balance || 0,
    trendItems: trends?.items || [],
  };
}
