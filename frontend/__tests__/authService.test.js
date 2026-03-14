const { loginUser, registerUser } = require("../services/authService");

describe("Auth Service Tests", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test("loginUser returns token on success", async () => {
    fetch.mockResponseOnce(JSON.stringify({ token: "fake-token" }));

    const result = await loginUser({
      email: "test@email.com",
      password: "123456",
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.token).toBe("fake-token");
  });

  test("loginUser throws error on failed login", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "Invalid credentials" }), {
      status: 401,
    });

    await expect(
      loginUser({
        email: "test@email.com",
        password: "wrong",
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  test("registerUser returns success message", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ message: "User successfully registered" }),
    );

    const result = await registerUser({
      name: "John",
      email: "john@email.com",
      password: "123456",
      country: "Finland",
      preferredCurrency: "EUR",
    });

    expect(result.message).toBe("User successfully registered");
  });
});
