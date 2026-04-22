import {
  createTransaction,
  getTransactions,
} from "../services/transactionService";

import { getCategories } from "../services/transactionService";


describe("transactionService - createTransaction", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("should create transaction successfully", async () => {
    const fakeToken = "test-token";

    const payload = {
      type: "expense",
      amount: 50,
      currency: "EUR",
      category: "Food",
      description: "Test",
      date: "2026-04-10",
    };

    const mockResponse = {
      id: 1,
      ...payload,
    };

    fetch.mockResponseOnce(JSON.stringify(mockResponse), {
      status: 201,
    });

    const result = await createTransaction(fakeToken, payload);

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/transactions"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${fakeToken}`,
        }),
      }),
    );

    expect(result.id).toBeDefined();
    expect(result.amount).toBe(50);
  });

  test("should throw error when API fails", async () => {
    const fakeToken = "test-token";

    const payload = {
      type: "expense",
      amount: 50,
      currency: "EUR",
      category: "Food",
      description: "Test",
      date: "2026-04-10",
    };

    fetch.mockResponseOnce(JSON.stringify({ message: "Invalid data" }), {
      status: 400,
    });

    await expect(createTransaction(fakeToken, payload)).rejects.toThrow(
      "Invalid data",
    );

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("transactionService - getTransactions", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("should fetch transactions successfully", async () => {
    const fakeToken = "test-token";

    const mockResponse = {
      items: [
        {
          id: 1,
          type: "expense",
          amount: 50,
        },
      ],
      total: 1,
    };

    fetch.mockResponseOnce(JSON.stringify(mockResponse), {
      status: 200,
    });

    const result = await getTransactions(fakeToken);

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/transactions"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: `Bearer ${fakeToken}`,
        }),
      }),
    );

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(1);
  });

  test("should include query params when filters provided", async () => {
    const fakeToken = "test-token";

    fetch.mockResponseOnce(JSON.stringify({ items: [], total: 0 }), {
      status: 200,
    });

    await getTransactions(fakeToken, {
      type: "expense",
      category: "Food",
      period: "2026-04",
    });

    const calledUrl = fetch.mock.calls[0][0];

    expect(calledUrl).toContain("type=expense");
    expect(calledUrl).toContain("category=Food");
    expect(calledUrl).toContain("period=2026-04");
  });

  test("should throw error on API failure", async () => {
    const fakeToken = "test-token";

    fetch.mockResponseOnce(
      JSON.stringify({ message: "Failed to fetch transactions" }),
      { status: 500 },
    );

    await expect(getTransactions(fakeToken)).rejects.toThrow(
      "Failed to fetch transactions",
    );
  });
});

import {
  deleteTransaction,
  updateTransaction,
} from "../services/transactionService";

describe("transactionService - updateTransaction", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("should update transaction successfully", async () => {
    const fakeToken = "test-token";
    const transactionId = 1;

    const payload = {
      type: "income",
      amount: 75,
      currency: "EUR",
      category: "Salary",
      description: "Updated",
      date: "2026-04-11",
    };

    const mockResponse = {
      id: transactionId,
      ...payload,
    };

    fetch.mockResponseOnce(JSON.stringify(mockResponse), {
      status: 200,
    });

    const result = await updateTransaction(fakeToken, transactionId, payload);

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/transactions/${transactionId}`),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: `Bearer ${fakeToken}`,
        }),
      }),
    );

    expect(result.amount).toBe(75);
    expect(result.type).toBe("income");
  });

  test("should throw error on update failure", async () => {
    const fakeToken = "test-token";

    fetch.mockResponseOnce(JSON.stringify({ message: "Update failed" }), {
      status: 400,
    });

    await expect(updateTransaction(fakeToken, 1, {})).rejects.toThrow(
      "Update failed",
    );
  });
});

describe("transactionService - deleteTransaction", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("should delete transaction successfully", async () => {
    const fakeToken = "test-token";
    const transactionId = 1;

    fetch.mockResponseOnce(JSON.stringify({ message: "Deleted" }), {
      status: 200,
    });

    const result = await deleteTransaction(fakeToken, transactionId);

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/transactions/${transactionId}`),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: `Bearer ${fakeToken}`,
        }),
      }),
    );

    expect(result.message).toBe("Deleted");
  });

  test("should throw error on delete failure", async () => {
    const fakeToken = "test-token";

    fetch.mockResponseOnce(JSON.stringify({ message: "Delete failed" }), {
      status: 500,
    });

    await expect(deleteTransaction(fakeToken, 1)).rejects.toThrow(
      "Delete failed",
    );
  });
});

describe("transactionService - getCategories", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("should fetch categories successfully", async () => {
    const fakeToken = "test-token";

    const mockResponse = {
      items: [
        { type: "expense", name: "Food" },
        { type: "income", name: "Salary" },
      ],
    };

    fetch.mockResponseOnce(JSON.stringify(mockResponse), {
      status: 200,
    });

    const result = await getCategories(fakeToken, "income");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.items.length).toBe(2);
  });

  test("should throw error on failure", async () => {
    const fakeToken = "test-token";

    fetch.mockResponseOnce(
      JSON.stringify({ message: "Failed to fetch categories" }),
      { status: 500 }
    );

    await expect(
      getCategories(fakeToken)
    ).rejects.toThrow("Failed to fetch categories");
  });
});
