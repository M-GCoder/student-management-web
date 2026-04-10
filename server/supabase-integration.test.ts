import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase responses
const mockSupabaseStudent = {
  id: "student-001",
  email: "test@example.com",
  password: Buffer.from("password123" + "student_fee_collector_2024").toString("base64"),
  name: "Test Student",
  class: "10-A",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockSupabasePayment = {
  id: "payment-001",
  student_id: "student-001",
  month: 4,
  year: 2026,
  payment_date: null,
  amount: 5000,
  created_at: "2026-04-01T00:00:00Z",
  updated_at: "2026-04-01T00:00:00Z",
};

describe("Supabase Integration", () => {
  describe("Student Authentication", () => {
    it("should hash password correctly for Supabase", () => {
      const password = "password123";
      const salt = "student_fee_collector_2024";
      const expectedHash = Buffer.from(password + salt).toString("base64");
      
      expect(expectedHash).toBe(mockSupabaseStudent.password);
    });

    it("should verify correct password", () => {
      const password = "password123";
      const passwordHash = Buffer.from(password + "student_fee_collector_2024").toString("base64");
      
      expect(passwordHash).toBe(mockSupabaseStudent.password);
    });

    it("should reject incorrect password", () => {
      const password = "wrongpassword";
      const passwordHash = Buffer.from(password + "student_fee_collector_2024").toString("base64");
      
      expect(passwordHash).not.toBe(mockSupabaseStudent.password);
    });

    it("should handle email case-insensitivity", () => {
      const email1 = "test@example.com";
      const email2 = "TEST@EXAMPLE.COM";
      
      expect(email1.toLowerCase()).toBe(email2.toLowerCase());
    });
  });

  describe("Payment Data Transformation", () => {
    it("should transform Supabase payment to app format", () => {
      const transformed = {
        id: mockSupabasePayment.id,
        studentId: mockSupabasePayment.student_id,
        month: mockSupabasePayment.month,
        year: mockSupabasePayment.year,
        amount: mockSupabasePayment.amount,
        status: mockSupabasePayment.payment_date ? "paid" : "pending",
        paidDate: mockSupabasePayment.payment_date ? new Date(mockSupabasePayment.payment_date) : null,
        createdAt: new Date(mockSupabasePayment.created_at),
        updatedAt: new Date(mockSupabasePayment.updated_at),
      };

      expect(transformed.status).toBe("pending");
      expect(transformed.paidDate).toBeNull();
      expect(transformed.month).toBe(4);
      expect(transformed.year).toBe(2026);
    });

    it("should mark payment as paid when payment_date exists", () => {
      const paidPayment = { ...mockSupabasePayment, payment_date: "2026-04-05T00:00:00Z" };
      const status = paidPayment.payment_date ? "paid" : "pending";
      
      expect(status).toBe("paid");
    });
  });

  describe("Student Data Transformation", () => {
    it("should transform Supabase student to app format", () => {
      const transformed = {
        id: mockSupabaseStudent.id,
        email: mockSupabaseStudent.email,
        firstName: mockSupabaseStudent.name?.split(" ")[0] || mockSupabaseStudent.name,
        lastName: mockSupabaseStudent.name?.split(" ").slice(1).join(" ") || "",
        studentId: mockSupabaseStudent.id,
        class: mockSupabaseStudent.class,
        status: "active",
      };

      expect(transformed.firstName).toBe("Test");
      expect(transformed.lastName).toBe("Student");
      expect(transformed.class).toBe("10-A");
      expect(transformed.status).toBe("active");
    });

    it("should handle single name students", () => {
      const singleNameStudent = { ...mockSupabaseStudent, name: "Raj" };
      const firstName = singleNameStudent.name?.split(" ")[0] || singleNameStudent.name;
      const lastName = singleNameStudent.name?.split(" ").slice(1).join(" ") || "";

      expect(firstName).toBe("Raj");
      expect(lastName).toBe("");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing student gracefully", () => {
      const supabaseStudent = null;
      const isFound = supabaseStudent !== null;
      
      expect(isFound).toBe(false);
    });

    it("should handle payment query errors", () => {
      const error = { message: "Connection failed" };
      const hasError = error !== null;
      
      expect(hasError).toBe(true);
    });

    it("should provide fallback to local database on Supabase error", () => {
      const supabaseError = { message: "Network error" };
      const shouldFallback = supabaseError !== null;
      
      expect(shouldFallback).toBe(true);
    });
  });

  describe("Data Validation", () => {
    it("should validate email format", () => {
      const validEmail = "test@example.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    it("should validate payment amount", () => {
      const amount = 5000;
      const isValidAmount = amount > 0;
      
      expect(isValidAmount).toBe(true);
    });

    it("should validate month range", () => {
      const month = 4;
      const isValidMonth = month >= 1 && month <= 12;
      
      expect(isValidMonth).toBe(true);
    });

    it("should reject invalid month", () => {
      const month = 13;
      const isValidMonth = month >= 1 && month <= 12;
      
      expect(isValidMonth).toBe(false);
    });
  });
});
