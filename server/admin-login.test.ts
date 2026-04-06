import { describe, expect, it } from "vitest";

describe("Admin Login Credentials", () => {
  // Helper function to check admin credentials
  const isAdminCredentials = (id: string, password: string): boolean => {
    return id === "admin@gmail.com" && password === "admin12345";
  };

  it("should recognize valid admin credentials", () => {
    const result = isAdminCredentials("admin@gmail.com", "admin12345");
    expect(result).toBe(true);
  });

  it("should reject incorrect admin ID", () => {
    const result = isAdminCredentials("admin@example.com", "admin12345");
    expect(result).toBe(false);
  });

  it("should reject incorrect admin password", () => {
    const result = isAdminCredentials("admin@gmail.com", "wrongpassword");
    expect(result).toBe(false);
  });

  it("should reject both incorrect ID and password", () => {
    const result = isAdminCredentials("admin@example.com", "wrongpassword");
    expect(result).toBe(false);
  });

  it("should not treat student credentials as admin", () => {
    const result = isAdminCredentials("STU001", "password123");
    expect(result).toBe(false);
  });

  it("should be case-sensitive for admin ID", () => {
    const result = isAdminCredentials("ADMIN@GMAIL.COM", "admin12345");
    expect(result).toBe(false);
  });

  it("should be case-sensitive for admin password", () => {
    const result = isAdminCredentials("admin@gmail.com", "ADMIN12345");
    expect(result).toBe(false);
  });

  it("should require exact match for both credentials", () => {
    const validId = "admin@gmail.com";
    const validPassword = "admin12345";
    const invalidId = "admin@gmail.co";
    const invalidPassword = "admin1234";

    expect(isAdminCredentials(validId, validPassword)).toBe(true);
    expect(isAdminCredentials(invalidId, validPassword)).toBe(false);
    expect(isAdminCredentials(validId, invalidPassword)).toBe(false);
    expect(isAdminCredentials(invalidId, invalidPassword)).toBe(false);
  });
});
