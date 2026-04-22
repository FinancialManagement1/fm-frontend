import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { useBudget } from "../hooks/useBudget";

global.fetch = require("jest-fetch-mock");

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

beforeEach(() => {
  fetch.resetMocks();
  jest.clearAllMocks();
});

describe("useBudget - fetchBudget", () => {
  test("should fetch and set budget", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    const mockData = {
      period: "2026-04",
      limit: 200,
      spent: 50,
      remaining: 150,
      progressPercentage: 25,
    };

    fetch.mockResponseOnce(JSON.stringify(mockData), { status: 200 });

    const { result } = renderHook(() => useBudget());

    await act(async () => {
      await result.current.fetchBudget("2026-04");
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(result.current.budget).toEqual(mockData);
    expect(result.current.limit).toBe(200);
    expect(result.current.spent).toBe(50);
    expect(result.current.remaining).toBe(150);
  });
});
test("should set error when fetchBudget fails", async () => {
  AsyncStorage.getItem.mockResolvedValue("fake-token");

  fetch.mockResponseOnce(JSON.stringify({ message: "API failed" }), {
    status: 500,
  });

  const { result } = renderHook(() => useBudget());

  await act(async () => {
    await result.current.fetchBudget("2026-04");
  });

  expect(result.current.error).toBe("API failed");
  expect(result.current.budget).toBeNull();
});
describe("useBudget - saveBudget", () => {
  test("should save budget and update state", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    const mockResponse = {
      period: "2026-04",
      limit: 300,
      spent: 50,
      remaining: 250,
      progressPercentage: 17,
    };

    fetch.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });

    const { result } = renderHook(() => useBudget());

    await act(async () => {
      await result.current.saveBudget("2026-04", 300);
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(result.current.budget).toEqual(mockResponse);
    expect(result.current.limit).toBe(300);
    expect(result.current.remaining).toBe(250);
  });
});
test("should reject zero or negative budget", async () => {
  AsyncStorage.getItem.mockResolvedValue("fake-token");

  const { result } = renderHook(() => useBudget());

  await act(async () => {
    const res = await result.current.saveBudget("2026-04", 0);
    expect(res).toBeNull();
  });

  expect(result.current.error).toBe("Budget limit must be greater than 0");
});
test("should reject invalid period format", async () => {
  AsyncStorage.getItem.mockResolvedValue("fake-token");

  const { result } = renderHook(() => useBudget());

  await act(async () => {
    const res = await result.current.saveBudget("2026/04", 200);
    expect(res).toBeNull();
  });

  expect(result.current.error).toBe("Period must be in YYYY-MM format");
});
test("should compute derived values correctly", async () => {
  AsyncStorage.getItem.mockResolvedValue("fake-token");

  fetch.mockResponseOnce(
    JSON.stringify({
      period: "2026-04",
      limit: 200,
      spent: 250,
      remaining: -50,
      progressPercentage: 125,
    }),
    { status: 200 },
  );

  const { result } = renderHook(() => useBudget());

  await act(async () => {
    await result.current.fetchBudget("2026-04");
  });

  expect(result.current.hasBudget).toBe(true);
  expect(result.current.isOverBudget).toBe(true);
  expect(result.current.progressPercentage).toBe(125);
  expect(result.current.remaining).toBe(-50);
});
