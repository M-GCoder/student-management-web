import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getLatestResult: vi.fn(),
  getCurrentMonthPayment: vi.fn(),
  getPaymentsByStudent: vi.fn(),
  getResultsByStudent: vi.fn(),
  getEnrollmentsByStudent: vi.fn(),
}));

function createPortalContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("portal router", () => {
  it("getLatestResult returns null when no result exists", async () => {
    const { getLatestResult } = await import("./db");
    vi.mocked(getLatestResult).mockResolvedValueOnce(undefined);

    const ctx = createPortalContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.portal.getLatestResult({ studentId: 1 });

    expect(result).toBeNull();
    expect(vi.mocked(getLatestResult)).toHaveBeenCalledWith(1);
  });

  it("getCurrentMonthFee returns null when no payment exists", async () => {
    const { getCurrentMonthPayment } = await import("./db");
    vi.mocked(getCurrentMonthPayment).mockResolvedValueOnce(undefined);

    const ctx = createPortalContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.portal.getCurrentMonthFee({
      studentId: 1,
      month: "2026-04",
    });

    expect(result).toBeNull();
    expect(vi.mocked(getCurrentMonthPayment)).toHaveBeenCalledWith(1, "2026-04");
  });

  it("getPaymentHistory returns empty array when no payments exist", async () => {
    const { getPaymentsByStudent } = await import("./db");
    vi.mocked(getPaymentsByStudent).mockResolvedValueOnce(undefined);

    const ctx = createPortalContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.portal.getPaymentHistory({ studentId: 1 });

    expect(result).toEqual([]);
    expect(vi.mocked(getPaymentsByStudent)).toHaveBeenCalledWith(1);
  });

  it("getAllResults returns empty array when no results exist", async () => {
    const { getResultsByStudent } = await import("./db");
    vi.mocked(getResultsByStudent).mockResolvedValueOnce(undefined);

    const ctx = createPortalContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.portal.getAllResults({ studentId: 1 });

    expect(result).toEqual([]);
    expect(vi.mocked(getResultsByStudent)).toHaveBeenCalledWith(1);
  });

  it("getEnrollments returns empty array when no enrollments exist", async () => {
    const { getEnrollmentsByStudent } = await import("./db");
    vi.mocked(getEnrollmentsByStudent).mockResolvedValueOnce(undefined);

    const ctx = createPortalContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.portal.getEnrollments({ studentId: 1 });

    expect(result).toEqual([]);
    expect(vi.mocked(getEnrollmentsByStudent)).toHaveBeenCalledWith(1);
  });
});
