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
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/scan"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${fakeToken}`,
        }),
      }),
    );
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
