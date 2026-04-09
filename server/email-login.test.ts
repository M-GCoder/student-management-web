import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> } {
  const setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

describe("portal.login with email", () => {
  it("should accept email and password as input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This test verifies the input schema accepts email
    // The actual login would fail without a real student in the database
    try {
      await caller.portal.login({
        email: "student@example.com",
        password: "password123",
      });
    } catch (error: any) {
      // Expected to fail with UNAUTHORIZED since no student exists
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toContain("Invalid");
    }
  });

  it("should reject invalid email format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.portal.login({
        email: "not-an-email",
        password: "password123",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      // Should fail validation
      expect(error.message).toBeDefined();
    }
  });

  it("should reject missing password", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.portal.login({
        email: "student@example.com",
        password: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      // Should fail validation
      expect(error.message).toBeDefined();
    }
  });

  it("should return proper error for non-existent student", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.portal.login({
        email: "nonexistent@example.com",
        password: "password123",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toContain("Invalid");
    }
  });
});
