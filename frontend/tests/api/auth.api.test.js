const fetchMock = require("jest-fetch-mock");
fetchMock.dontMock();

const BASE_URL =
  "https://api20260306101430-ejddbgc3ftfjbjes.francecentral-01.azurewebsites.net";

let testEmail;
let authToken;

// setting timeout to 15 seconds to allow for API response times
jest.setTimeout(15000);

describe("Auth API Tests", () => {
  beforeAll(async () => {
    testEmail = `testuser_${Date.now()}@email.com`;

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
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

    const registerText = await registerResponse.text();
    console.log("REGISTER RAW:", registerText);

    expect(registerResponse.status).toBe(201);
    expect(registerText).not.toBe("");

    const registerData = JSON.parse(registerText);
    expect(registerData.message).toBeDefined();
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

    authToken = data.token;
  });

  test("Dashboard API should return user summary", async () => {
    if (!authToken) {
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
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

      const loginText = await loginResponse.text();
      console.log("LOGIN (for dashboard) RAW:", loginText);

      expect(loginResponse.status).toBe(200);

      const loginData = JSON.parse(loginText);
      authToken = loginData.token;
    }

    const dashboardResponse = await fetch(`${BASE_URL}/dashboard/summary`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
    });

    const dashboardText = await dashboardResponse.text();
    console.log("DASHBOARD RAW:", dashboardText);

    expect(dashboardResponse.status).toBe(200);
    expect(dashboardText).not.toBe("");

    const data = JSON.parse(dashboardText);

    expect(data.userName).toBeDefined();
    expect(data.currency).toBeDefined();
    expect(data.period).toBeDefined();

    expect(data.summary).toBeDefined();
    expect(data.summary.totalBalance).toBeDefined();
    expect(data.summary.income).toBeDefined();
    expect(data.summary.expenses).toBeDefined();

    expect(data.monthlyBudget).toBeDefined();
    expect(data.monthlyBudget.spent).toBeDefined();
    expect(data.monthlyBudget.limit).toBeDefined();
    expect(data.monthlyBudget.remaining).toBeDefined();
    expect(data.monthlyBudget.progressPercentage).toBeDefined();
    expect(data.summary.totalBalance).toBeGreaterThanOrEqual(0);
    expect(data.summary.income).toBeGreaterThanOrEqual(0);
    expect(data.summary.expenses).toBeGreaterThanOrEqual(0);

    expect(data.monthlyBudget.progressPercentage).toBeGreaterThanOrEqual(0);
    expect(data.monthlyBudget.progressPercentage).toBeLessThanOrEqual(100);
  });
});
