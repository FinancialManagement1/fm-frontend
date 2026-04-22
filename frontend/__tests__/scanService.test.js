import { confirmScan, scanReceipt } from "../services/scanService";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

describe("scanService - scanReceipt", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  const fakeToken = "test-token";

  const fakeImage = {
    uri: "file://test.jpg",
    mimeType: "image/jpeg",
    fileName: "test.jpg",
  };

  test("should return scanId on success", async () => {
    fetch.mockResponseOnce(JSON.stringify({ scanId: "123" }), { status: 200 });

    const result = await scanReceipt(fakeToken, fakeImage);

    expect(result.scanId).toBe("123");
  });

  test("should handle nested text response", async () => {
    fetch.mockResponseOnce(JSON.stringify({ text: { scanId: "abc" } }), {
      status: 200,
    });

    const result = await scanReceipt(fakeToken, fakeImage);

    expect(result.scanId).toBe("abc");
  });

  test("should throw error if scanId missing", async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 200 });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });

  test("should handle non-JSON response", async () => {
    fetch.mockResponseOnce("not-json", { status: 200 });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });

  test("should throw error on HTTP failure", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "Bad request" }), {
      status: 400,
    });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Bad request",
    );
  });

  test("should throw error when scan data is malformed", async () => {
    fetch.mockResponseOnce(JSON.stringify({ total: "abc", date: null }), {
      status: 200,
    });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });
  test("should throw error when network fails", async () => {
    fetch.mockRejectOnce(new Error("Network error"));

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Network error",
    );
  });
  test("should throw error on empty response body", async () => {
    fetch.mockResponseOnce("", { status: 200 });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });
  test("should throw error when text exists but scanId missing", async () => {
    fetch.mockResponseOnce(JSON.stringify({ text: { wrongField: "no-id" } }), {
      status: 200,
    });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });
  test("should throw error when token is missing", async () => {
    await expect(scanReceipt(null, fakeImage)).rejects.toThrow();
  });
  test("should throw error on empty object response", async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 200 });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });
  test("should throw error when scanId is not a string", async () => {
    fetch.mockResponseOnce(JSON.stringify({ scanId: 123 }), { status: 200 });

    await expect(scanReceipt(fakeToken, fakeImage)).rejects.toThrow(
      "Invalid scan response from server",
    );
  });
});
describe("scanService - confirmScan", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  const fakeToken = "test-token";

  const payload = {
    scanId: "123",
    type: "expense",
    amount: 50,
    category: "Food",
    date: "2026-04-10",
  };

  test("should return data on success", async () => {
    fetch.mockResponseOnce(JSON.stringify({ id: 1, ...payload }), {
      status: 201,
    });

    const result = await confirmScan(fakeToken, payload);

    expect(result.id).toBeDefined();
  });

  test("should handle empty success response", async () => {
    fetch.mockResponseOnce("", { status: 200 });

    const result = await confirmScan(fakeToken, payload);

    expect(result.success).toBe(true);
  });

  test("should throw error on invalid JSON", async () => {
    fetch.mockResponseOnce("not-json", { status: 200 });

    await expect(confirmScan(fakeToken, payload)).rejects.toThrow(
      "Invalid JSON from server",
    );
  });

  test("should throw error on HTTP failure", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "Bad request" }), {
      status: 400,
    });

    await expect(confirmScan(fakeToken, payload)).rejects.toThrow(
      "Bad request",
    );
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});
