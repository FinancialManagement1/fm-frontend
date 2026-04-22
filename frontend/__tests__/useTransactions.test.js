import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { useTransactions } from "../hooks/useTransactions";
import * as service from "../services/transactionService";

jest.mock("../services/transactionService");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

describe("useTransactions - fetchTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch and set transactions", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    service.getTransactions.mockResolvedValue({
      items: [{ id: 1, amount: 50 }],
      total: 1,
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.fetchTransactions();
    });

    expect(service.getTransactions).toHaveBeenCalledWith("fake-token", {});
    expect(result.current.transactions.length).toBe(1);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBe(null);
  });
});
test("should set error when fetch fails", async () => {
  AsyncStorage.getItem.mockResolvedValue("fake-token");

  service.getTransactions.mockRejectedValue(new Error("API failed"));

  const { result } = renderHook(() => useTransactions());

  await act(async () => {
    await result.current.fetchTransactions();
  });

  expect(result.current.error).toBe("API failed");
  expect(result.current.transactions).toEqual([]);
});
describe("useTransactions - addTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should add transaction and update state", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    service.createTransaction.mockResolvedValue({
      id: 1,
      amount: 50,
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.addTransaction({
        amount: 50,
      });
    });

    expect(result.current.transactions.length).toBe(1);
    expect(result.current.total).toBe(1);
  });
});
describe("useTransactions - editTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update existing transaction", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    const initialTx = { id: 1, amount: 50 };

    service.updateTransaction.mockResolvedValue({
      id: 1,
      amount: 100,
    });

    const { result } = renderHook(() => useTransactions());

    // preload state (important — no assumptions)
    await act(async () => {
      result.current.transactions.push(initialTx);
    });

    await act(async () => {
      await result.current.editTransaction(1, { amount: 100 });
    });

    expect(result.current.transactions[0].amount).toBe(100);
  });
});
describe("useTransactions - removeTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should remove transaction and update total", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    service.createTransaction
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 });

    service.deleteTransaction.mockResolvedValue({});

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.addTransaction({});
      await result.current.addTransaction({});
    });

    await act(async () => {
      await result.current.removeTransaction(1);
    });

    expect(result.current.transactions.length).toBe(1);
    expect(result.current.transactions[0].id).toBe(2);
    expect(result.current.total).toBe(1);
  });
});
describe("useTransactions - fetchCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch categories and set state", async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");

    service.getCategories.mockResolvedValue({
      items: [
        { type: "expense", name: "Food" },
        { type: "income", name: "Salary" },
      ],
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.fetchCategories("expense");
    });

    expect(service.getCategories).toHaveBeenCalledWith("fake-token", "expense");
    expect(result.current.categories.length).toBe(2);
    expect(result.current.error).toBe(null);
  });
});
