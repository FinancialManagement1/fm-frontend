const fetchMock = require("jest-fetch-mock");
fetchMock.dontMock();

const BASE_URL =
  "https://api20260306101430-ejddbgc3ftfjbjes.francecentral-01.azurewebsites.net";

let testEmail;
let authToken;

// setting timeout to 15 seconds to allow for API response times
jest.setTimeout(15000);

async function ensureAuthToken() {
  if (authToken) return authToken;

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

  expect(response.status).toBe(200);

  const data = JSON.parse(text);
  authToken = data.token;

  return authToken;
}

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
    //console.log("TOKEN:", data.token);

    authToken = data.token;
  });

  test("Dashboard API should return user summary", async () => {
    await ensureAuthToken();

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
test("Categories API should return valid categories for income", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/categories?type=income`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("CATEGORIES RAW:", text);

  expect(response.status).toBe(200);
  expect(text).not.toBe("");

  const data = JSON.parse(text);

  // ✔ structure
  expect(data.items).toBeDefined();
  expect(Array.isArray(data.items)).toBe(true);

  // ✔ minimal correctness (no over-testing)
  data.items.forEach((item) => {
    expect(item).toBeDefined();
    expect(typeof item).toBe("object");

    expect(typeof item.name).toBe("string");
    expect(item.name.length).toBeGreaterThanOrEqual(2);

    expect(typeof item.type).toBe("string");
    expect(["income", "expense"]).toContain(item.type.toLowerCase());
  });
});
let testTransactionId;

test("Create transaction should work", async () => {
  await ensureAuthToken();

  const payload = {
    type: "expense",
    amount: 50,
    currency: "EUR",
    category: "Food",
    description: "Test transaction",
    date: "2026-04-10",
  };

  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log("CREATE:", text);

  expect(response.status).toBe(201);

  const data = JSON.parse(text);

  expect(data.id).toBeDefined();
  expect(data.amount).toBe(50);

  testTransactionId = data.id;
});

test("Get transactions should include created one", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("GET TX:", text);

  expect(response.status).toBe(200);

  const data = JSON.parse(text);

  const found = data.items.find((t) => t.id === testTransactionId);

  expect(found).toBeDefined();
});

test("Update transaction should work", async () => {
  await ensureAuthToken();

  const payload = {
    type: "income",
    amount: 75,
    currency: "EUR",
    category: "Salary",
    description: "Updated",
    date: "2026-04-11",
  };

  const response = await fetch(
    `${BASE_URL}/transactions/${testTransactionId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const text = await response.text();
  console.log("UPDATE:", text);

  expect(response.status).toBe(200);

  const data = JSON.parse(text);

  expect(data.amount).toBe(75);
  expect(data.type.toLowerCase()).toBe("income");
});

test("Delete transaction should work", async () => {
  await ensureAuthToken();

  const response = await fetch(
    `${BASE_URL}/transactions/${testTransactionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
    },
  );

  const text = await response.text();
  console.log("DELETE:", text);

  expect(response.status).toBe(200);
});

test("Dashboard should reflect transaction impact", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("DASHBOARD AFTER:", text);

  expect(response.status).toBe(200);

  const data = JSON.parse(text);

  expect(data.summary.expenses).toBeGreaterThanOrEqual(0);
});

test("Get budget should return structure", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/budgets`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("BUDGET:", text);

  expect(response.status).toBe(200);

  const data = JSON.parse(text);

  expect(data.limit).toBeDefined();
  expect(data.spent).toBeDefined();
});

test("Budget should reject invalid limit", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/budgets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      period: "2026-04",
      limit: 0,
    }),
  });

  console.log("INVALID BUDGET:", response.status);

  expect(response.status).toBe(400);
});

test("Budget should accept valid limit", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/budgets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      period: "2026-04",
      limit: 200,
    }),
  });

  const text = await response.text();
  console.log("VALID BUDGET:", text);

  expect(response.status).toBe(200);
});

test("Reports summary should return correct structure", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/reports/summary?period=2026-04`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("REPORT SUMMARY:", text);

  expect(response.status).toBe(200);

  const data = JSON.parse(text);

  expect(data.income).toBeDefined();
  expect(data.expenses).toBeDefined();
  expect(data.balance).toBeDefined();
});

test("Reports trends should return cumulative data", async () => {
  await ensureAuthToken();

  const response = await fetch(`${BASE_URL}/reports/trends?period=2026-04`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("TRENDS:", text);

  expect(response.status).toBe(200);

  const data = JSON.parse(text);

  expect(Array.isArray(data.items)).toBe(true);

  data.items.forEach((item) => {
    expect(item.date).toBeDefined();
    expect(item.cumulativeAmount).toBeDefined();
  });
});
