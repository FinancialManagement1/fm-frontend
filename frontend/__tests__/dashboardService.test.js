import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDashboardSummary } from "../services/dashboardService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

describe("dashboardService", () => {
  beforeEach(() => {
    fetch.resetMocks();
    jest.clearAllMocks();
  });

  test("returns dashboard data on success", async () => {
    AsyncStorage.getItem.mockResolvedValue("real-token");

    fetch.mockResponseOnce(
      JSON.stringify({
        userName: "John Doe",
        currency: "EUR",
        period: "2026-03",
        summary: {
          totalBalance: 0,
          income: 0,
          expenses: 0,
        },
        monthlyBudget: {
          spent: 0,
          limit: 0,
          remaining: 0,
          progressPercentage: 0,
        },
      }),
      { status: 200 },
    );

    const result = await getDashboardSummary();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("authToken");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api20260306101430-ejddbgc3ftfjbjes.francecentral-01.azurewebsites.net/dashboard/summary",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer real-token",
          Accept: "application/json",
        },
      },
    );

    expect(result.userName).toBe("John Doe");
    expect(result.currency).toBe("EUR");
    expect(result.summary.totalBalance).toBe(0);
  });

  test("throws error when auth token is missing", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    await expect(getDashboardSummary()).rejects.toThrow("No auth token found");

    expect(fetch).not.toHaveBeenCalled();
  });

  test("throws backend message when request fails", async () => {
    AsyncStorage.getItem.mockResolvedValue("real-token");

    fetch.mockResponseOnce(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });

    await expect(getDashboardSummary()).rejects.toThrow("Unauthorized");
  });

  test("throws generic error when failed response has no message", async () => {
    AsyncStorage.getItem.mockResolvedValue("real-token");

    fetch.mockResponseOnce("", { status: 500 });

    await expect(getDashboardSummary()).rejects.toThrow(
      "Failed to fetch dashboard",
    );
  });

  test("throws error when response JSON is invalid", async () => {
    AsyncStorage.getItem.mockResolvedValue("real-token");

    fetch.mockResponseOnce("not-json", { status: 200 });

    await expect(getDashboardSummary()).rejects.toThrow(
      "Invalid JSON response",
    );
  });

  test("throws error when response structure is invalid", async () => {
    AsyncStorage.getItem.mockResolvedValue("real-token");

    fetch.mockResponseOnce(
      JSON.stringify({
        userName: "John Doe",
        currency: "EUR",
        period: "2026-03",
      }),
      { status: 200 },
    );

    await expect(getDashboardSummary()).rejects.toThrow(
      "Invalid API response structure",
    );
  });
});