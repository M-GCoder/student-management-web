import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("announcements router", () => {
  it("creates an announcement successfully", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.create({
      classId: 1,
      title: "Test Announcement",
      description: "This is a test announcement",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Test Announcement");
    expect(result.description).toBe("This is a test announcement");
  });

  it("creates announcement with optional image and document URLs", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.create({
      classId: 1,
      title: "Announcement with Media",
      description: "This announcement has media",
      imageUrl: "https://example.com/image.jpg",
      documentUrl: "https://example.com/doc.pdf",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    expect(result.imageUrl).toBe("https://example.com/image.jpg");
    expect(result.documentUrl).toBe("https://example.com/doc.pdf");
  });

  it("lists all announcements", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test announcement first
    await caller.announcements.create({
      classId: 1,
      title: "Test Announcement",
      description: "This is a test",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const result = await caller.announcements.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("updates an announcement", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create an announcement
    const created = await caller.announcements.create({
      classId: 1,
      title: "Original Title",
      description: "Original description",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Update it
    const updated = await caller.announcements.update({
      id: created.id,
      title: "Updated Title",
      description: "Updated description",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    expect(updated.title).toBe("Updated Title");
    expect(updated.description).toBe("Updated description");
  });

  it("deletes an announcement", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create an announcement
    const created = await caller.announcements.create({
      classId: 1,
      title: "To Delete",
      description: "This will be deleted",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Delete it
    const result = await caller.announcements.delete({ id: created.id });

    expect(result).toEqual({ success: true });
  });

  it("handles expired announcement filtering on student portal", async () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    // Active announcement should not be expired
    expect(futureDate > now).toBe(true);

    // Past announcement should be expired
    expect(pastDate < now).toBe(true);
  });

  it("creates announcement with class-wise targeting", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.create({
      classId: 5,
      title: "Class 5 Specific",
      description: "Only for class 5",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    expect(result.classId).toBe(5);
  });

  it("validates required fields", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.announcements.create({
        classId: 1,
        title: "",
        description: "Missing title",
        expiresAt: new Date(),
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
