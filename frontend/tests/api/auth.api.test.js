const fetchMock = require("jest-fetch-mock");
fetchMock.dontMock();

const BASE_URL =
  "https://api20260306101430-ejddbgc3ftfjbjes.francecentral-01.azurewebsites.net";

let testEmail;

describe("Auth API Tests", () => {
  test("Register API should create new user", async () => {
    testEmail = `testuser_${Date.now()}@email.com`;

    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: "123456",
        country: "Finland",
        preferredCurrency: "EUR",
      }),
    });

    const text = await response.text();
    console.log("REGISTER RAW:", text);

    expect(response.status).toBe(201);

    expect(text).not.toBe("");

    const data = JSON.parse(text);
    expect(data.message).toBeDefined();
  });

  test("Login API should return token", async () => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: "123456",
      }),
    });

    const text = await response.text();
    console.log("LOGIN RAW:", text);

    expect(response.status).toBe(200);

    expect(text).not.toBe("");

    const data = JSON.parse(text);
    expect(data.token).toBeDefined();
  });
});
