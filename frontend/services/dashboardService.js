import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
  "https://api20260306101430-ejddbgc3ftfjbjes.francecentral-01.azurewebsites.net";

export async function getDashboardSummary() {
  const token = await AsyncStorage.getItem("token");
  console.log("DASHBOARD TOKEN:", token);

  if (!token) {
    throw new Error("No auth token found");
  }
  const currentMonth = new Date().toISOString().slice(0, 7);

  const response = await fetch(
    `${BASE_URL}/dashboard/summary?period=${currentMonth}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  let data = null;
  const text = await response.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response");
    }
  }

  if (!response.ok) {
    /*console.log("DASHBOARD ERROR RESPONSE:", data);
    throw new Error(data?.message || "Failed to fetch dashboard");*/
    console.log("Dashboard API failed — skipping for now");
    return null;
  }

  /*if (
    !data ||
    !data.summary ||
    !data.monthlyBudget ||
    typeof data.userName !== "string" ||
    typeof data.currency !== "string" ||
    typeof data.period !== "string"
  ) {
    throw new Error("Invalid API response structure");
  }*/
  if (!data) {
    console.log("Dashboard empty response — skipping");
    return null;
  }

  return data;
}
