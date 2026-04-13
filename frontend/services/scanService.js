import { API_BASE_URL } from "../constants/api";

// ── Shared error handler ──
// Parses HTTP errors into consistent thrown messages
function handleHttpError(response, data) {
  switch (response.status) {
    case 400:
      throw new Error(data.message || "Bad request. Please check your input.");
    case 401:
      throw new Error("Unauthorized. Please login again.");
    case 404:
      throw new Error("Transaction not found.");
    case 500:
      throw new Error("Something went wrong. Try again.");
    default:
      throw new Error(data.message || `Unexpected error (${response.status}).`);
  }
}

// ── Scan a receipt image via multipart/form-data ──
// imageFile: { uri, mimeType, fileName } — from image picker or camera
// documentType (optional): "receipt" | "invoice" — helps AI accuracy
export async function scanReceipt(token, imageFile, documentType) {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: imageFile.uri,
      type: imageFile.mimeType || "image/jpeg",
      name: imageFile.fileName || "receipt.jpg",
    });

    if (documentType) {
      formData.append("documentType", documentType);
    }

    // Do NOT set Content-Type manually — fetch sets it automatically
    // with the correct multipart boundary when body is FormData
    const response = await fetch(`${API_BASE_URL}/scan/receipt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      handleHttpError(response, data);
    }

    return data;
  } catch (error) {
    console.error("scanReceipt error:", error);
    throw error;
  }
}

// ── Confirm a scanned receipt and create transaction ──
// confirmData must include: scanId, type, amount, category, date
// confirmData optional: currency, description
export async function confirmScan(token, confirmData) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(confirmData),
    });

    const data = await response.json();

    if (!response.ok) {
      handleHttpError(response, data);
    }

    return data;
  } catch (error) {
    console.error("confirmScan error:", error);
    throw error;
  }
}