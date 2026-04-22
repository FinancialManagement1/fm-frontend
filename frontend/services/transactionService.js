import { API_BASE_URL } from "../constants/api";

export async function getTransactions(token, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.category) params.append("category", filters.category);
    if (filters.period) params.append("period", filters.period);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch transactions");
    return data;
  } catch (error) {
    console.error("getTransactions error:", error);
    throw error;
  }
}

export async function createTransaction(token, transactionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create transaction");
    return data;
  } catch (error) {
    console.error("createTransaction error:", error);
    throw error;
  }
}

export async function updateTransaction(token, transactionId, transactionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update transaction");
    return data;
  } catch (error) {
    console.error("updateTransaction error:", error);
    throw error;
  }
}

export async function deleteTransaction(token, transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete transaction");
    return data;
  } catch (error) {
    console.error("deleteTransaction error:", error);
    throw error;
  }
}

export async function getCategories(token, type) {
  try {
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
    if (!response.ok) throw new Error(data.message || "Failed to fetch categories");
    return data;
  } catch (error) {
    console.error("getCategories error:", error);
    throw error;
  }
}