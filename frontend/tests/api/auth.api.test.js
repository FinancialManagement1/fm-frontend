const BASE_URL =
  "https://api20260306101430-ejddbgc3ftfjbjes.francecentral-01.azurewebsites.net";

describe("Auth API Tests", () => {

  test("Register API should create new user", async () => {

    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test User",
        email: "testuser123@email.com",
        password: "123456",
        country: "Finland",
        preferredCurrency: "EUR"
      })
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain("registered");

  });


  test("Login API should return token", async () => {

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "testuser123@email.com",
        password: "123456"
      })
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();

  });

});