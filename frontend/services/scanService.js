import { API_BASE_URL, ENDPOINTS } from "../constants/api";

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
// imageFile: { uri, mimeType, fileName }
// documentType (optional): "receipt" | "invoice"
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

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SCAN}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // 🔍 Read RAW response first (critical debug step)
    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("Response is not JSON");
      }
    }
    if (!response.ok) {
      console.log("STATUS:", response.status);
      console.log("RESPONSE BODY:", text);
      handleHttpError(response, data || {});
    }
    const normalizedData = data?.text || data;

    if (!normalizedData || !normalizedData.scanId) {
      throw new Error("Invalid scan response from server");
    }

    return normalizedData;
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
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(confirmData),
    });

    console.log("CONFIRM STATUS:", response.status);

    const text = await response.text();
    console.log("CONFIRM RAW RESPONSE:", text);

    // handle success with empty body
    if (response.ok && !text) {
      return { success: true };
    }

    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON from server: " + text);
      }
    }

    if (!response.ok) {
      handleHttpError(response, data);
    }

    return data;
  } catch (error) {
    console.error("confirmScan error:", error);
    throw error;
  }
}
