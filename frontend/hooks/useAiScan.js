import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scanReceipt, confirmScan } from "../services/scanService";

// ── Custom error class so UI can detect auth errors and redirect ──
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

export function useAiScan() {
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Get token helper ──
  // Throws AuthError if no token — UI should catch this and redirect to login
  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new AuthError("No token found. Please login.");
    return token;
  };

  // ── Scan receipt image ──
  // imageFile: { uri, mimeType, fileName }
  // documentType (optional): "receipt" | "invoice"
  // Returns the full API response so UI can display extracted fields + confidence
  const performScan = useCallback(async (imageFile, documentType) => {
    setScanLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const token = await getToken();
      const result = await scanReceipt(token, imageFile, documentType);
      setScanResult(result);
      return result;
    } catch (err) {
      console.error("performScan error:", err);
      setError(err.message);
      throw err; // Re-throw so UI can handle AuthError (redirect) vs other errors (show message)
    } finally {
      setScanLoading(false);
    }
  }, []);

  // ── Confirm scanned receipt → create transaction ──
  // confirmData must include: scanId, type, amount, category, date
  // confirmData optional: currency, description
  const confirmTransaction = useCallback(async (confirmData) => {
    setConfirmLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await confirmScan(token, confirmData);
      return result;
    } catch (err) {
      console.error("confirmTransaction error:", err);
      setError(err.message);
      throw err; // Re-throw so UI can handle AuthError (redirect) vs other errors (show message)
    } finally {
      setConfirmLoading(false);
    }
  }, []);

  // ── Reset scan state (e.g. when user starts a new scan) ──
  const resetScan = useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  return {
    // ── State ──
    scanResult,      // Full API response: { scanId, status, amount, merchant, date, confidence, ... }
    scanLoading,     // true while /scan/receipt is in-flight
    confirmLoading,  // true while /transactions/confirm is in-flight
    error,           // Error message string or null

    // ── Actions ──
    performScan,         // (imageFile, documentType?) => Promise<scanResult>
    confirmTransaction,  // (confirmData) => Promise<transaction>
    resetScan,           // () => void — clears scanResult and error
  };
}