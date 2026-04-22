import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { useCategories } from "../hooks/useCategories";

global.fetch = require("jest-fetch-mock");

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

beforeEach(() => {
  fetch.resetMocks();
  jest.clearAllMocks();
});

describe("useCategories - fetchIncomeCategories", () => {
  test("should fetch and set income categories", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    const mockData = {
      items: [
        { type: "income", name: "Salary" },
        { type: "income", name: "Freelance" },
      ],
    };

    fetch.mockResponseOnce(JSON.stringify(mockData), { status: 200 });

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchIncomeCategories();
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(result.current.incomeCategories.length).toBe(2);
    expect(result.current.incomeCategories[0].name).toBe("Salary");
  });
});
describe("useCategories - fetchExpenseCategories", () => {
  test("should fetch and set expense categories", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    const mockData = {
      items: [
        { type: "expense", name: "Food" },
        { type: "expense", name: "Transport" },
      ],
    };

    fetch.mockResponseOnce(JSON.stringify(mockData), { status: 200 });

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchExpenseCategories();
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(result.current.expenseCategories.length).toBe(2);
    expect(result.current.expenseCategories[0].name).toBe("Food");
  });
});
describe("useCategories - fetchAllCategories", () => {
  test("should fetch and correctly filter income and expense categories", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    // ❗ backend returns mixed data (this is REALISTIC)
    const incomeResponse = {
      items: [
        { type: "income", name: "Salary" },
        { type: "expense", name: "Food" }, // wrong type mixed in
      ],
    };

    const expenseResponse = {
      items: [
        { type: "expense", name: "Transport" },
        { type: "income", name: "Freelance" }, // wrong type mixed in
      ],
    };

    fetch
      .mockResponseOnce(JSON.stringify(incomeResponse), { status: 200 })
      .mockResponseOnce(JSON.stringify(expenseResponse), { status: 200 });

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchAllCategories();
    });

    // ✅ only correct types should remain
    expect(result.current.incomeCategories).toEqual([
      { type: "income", name: "Salary" },
    ]);

    expect(result.current.expenseCategories).toEqual([
      { type: "expense", name: "Transport" },
    ]);
  });
});
describe("useCategories - error handling", () => {
  test("should set error when API fails", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    fetch.mockResponseOnce(JSON.stringify({ message: "API failed" }), {
      status: 500,
    });

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchIncomeCategories();
    });

    expect(result.current.error).toBe("API failed");
    expect(result.current.incomeCategories).toEqual([]);
  });
});
