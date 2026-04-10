import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  uniqueIndex,
  index
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students table - stores student information with login credentials
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  studentId: varchar("studentId", { length: 50 }).notNull().unique(), // Unique student ID for login
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("passwordHash").notNull(), // Hashed password
  classId: int("classId"), // Current class enrollment
  status: mysqlEnum("status", ["active", "inactive", "graduated"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentIdIdx: uniqueIndex("studentId_idx").on(table.studentId),
  classIdIdx: index("classId_idx").on(table.classId),
}));

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Classes table - stores class information
 */
export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  className: varchar("className", { length: 100 }).notNull(),
  capacity: int("capacity"),
  classTimings: text("classTimings"), // JSON array of {day, startTime, endTime}
  status: mysqlEnum("status", ["active", "inactive", "completed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

/**
 * Student Enrollments - tracks which students are enrolled in which classes
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  classId: int("classId").notNull(),
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "completed", "dropped"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentIdIdx: index("enrollment_studentId_idx").on(table.studentId),
  classIdIdx: index("enrollment_classId_idx").on(table.classId),
}));

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Payments table - stores monthly fee payment records
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  classId: int("classId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  dueDate: varchar("dueDate", { length: 10 }), // YYYY-MM-DD
  paidDate: varchar("paidDate", { length: 10 }), // YYYY-MM-DD
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentIdIdx: index("payment_studentId_idx").on(table.studentId),
  classIdIdx: index("payment_classId_idx").on(table.classId),
  monthIdx: index("payment_month_idx").on(table.month),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Exam Results table - stores student exam scores
 */
export const examResults = mysqlTable("examResults", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  classId: int("classId").notNull(),
  examName: varchar("examName", { length: 100 }).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  totalMarks: decimal("totalMarks", { precision: 5, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  grade: varchar("grade", { length: 2 }), // A, B, C, D, F
  examDate: varchar("examDate", { length: 10 }).notNull(), // YYYY-MM-DD
  publishedDate: varchar("publishedDate", { length: 10 }), // YYYY-MM-DD
  remarks: text("remarks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  studentIdIdx: index("result_studentId_idx").on(table.studentId),
  classIdIdx: index("result_classId_idx").on(table.classId),
  examDateIdx: index("result_examDate_idx").on(table.examDate),
}));

export type ExamResult = typeof examResults.$inferSelect;
export type InsertExamResult = typeof examResults.$inferInsert;

/**
 * Notifications table - tracks email notifications sent to students
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  type: mysqlEnum("type", ["fee_added", "payment_status_changed", "result_published"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  sent: boolean("sent").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  relatedPaymentId: int("relatedPaymentId"),
  relatedResultId: int("relatedResultId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  studentIdIdx: index("notification_studentId_idx").on(table.studentId),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
