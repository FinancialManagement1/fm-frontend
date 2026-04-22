import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from "../services/transactionService";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found. Please login.");
    return token;
  };

  const fetchTransactions = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await getTransactions(token, filters);
      setTransactions(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("fetchTransactions error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const newTransaction = await createTransaction(token, transactionData);
      setTransactions((prev) => [newTransaction, ...prev]);
      setTotal((prev) => prev + 1);
      return newTransaction;
    } catch (err) {
      console.error("addTransaction error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editTransaction = useCallback(async (transactionId, transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const updated = await updateTransaction(token, transactionId, transactionData);
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === transactionId ? updated : tx))
      );
      return updated;
    } catch (err) {
      console.error("editTransaction error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTransaction = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      await deleteTransaction(token, transactionId);
      setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("removeTransaction error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (type) => {
    setError(null);
    try {
      const token = await getToken();
      const data = await getCategories(token, type);
      setCategories(data.items || []);
      return data.items || [];
    } catch (err) {
      console.error("fetchCategories error:", err);
      setError(err.message);
    }
  }, []);

  return {
    transactions,
    categories,
    loading,
    error,
    total,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    fetchCategories,
  };
}