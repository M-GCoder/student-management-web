import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  students,
  classes,
  enrollments,
  payments,
  examResults,
  notifications,
  Student,
  Class,
  Enrollment,
  Payment,
  ExamResult,
  Notification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= STUDENT QUERIES =============

export async function getStudentByStudentId(studentId: string): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(students).where(eq(students.studentId, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentByEmail(email: string): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(students).where(eq(students.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentById(id: number): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents(): Promise<Student[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(students).orderBy(desc(students.createdAt));
}

export async function getStudentsByClass(classId: number): Promise<Student[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(students).where(eq(students.classId, classId));
}

export async function createStudent(data: {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  dateOfBirth?: string;
  address?: string;
}): Promise<Student> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(students).values(data);
  const id = (result as any).insertId;
  const student = await getStudentById(id);
  if (!student) throw new Error("Failed to create student");
  return student;
}

export async function updateStudent(id: number, data: Partial<Student>): Promise<Student> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(students).set(data).where(eq(students.id, id));
  const student = await getStudentById(id);
  if (!student) throw new Error("Failed to update student");
  return student;
}

export async function deleteStudent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(students).where(eq(students.id, id));
}

// ============= CLASS QUERIES =============

export async function getAllClasses(): Promise<Class[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(classes).orderBy(desc(classes.createdAt));
}

export async function getClassById(id: number): Promise<Class | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClass(data: {
  className: string;
  description?: string;
  instructor?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}): Promise<Class> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(classes).values(data);
  const id = (result as any).insertId;
  const classData = await getClassById(id);
  if (!classData) throw new Error("Failed to create class");
  return classData;
}

export async function updateClass(id: number, data: Partial<Class>): Promise<Class> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(classes).set(data).where(eq(classes.id, id));
  const classData = await getClassById(id);
  if (!classData) throw new Error("Failed to update class");
  return classData;
}

export async function deleteClass(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(classes).where(eq(classes.id, id));
}

// ============= ENROLLMENT QUERIES =============

export async function getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
}

export async function getEnrollmentsByClass(classId: number): Promise<Enrollment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(enrollments).where(eq(enrollments.classId, classId));
}

export async function createEnrollment(studentId: number, classId: number): Promise<Enrollment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(enrollments).values({ studentId, classId });
  const id = (result as any).insertId;
  const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
  if (enrollment.length === 0) throw new Error("Failed to create enrollment");
  return enrollment[0];
}

// ============= PAYMENT QUERIES =============

export async function getPaymentsByStudent(studentId: number): Promise<Payment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(payments).where(eq(payments.studentId, studentId)).orderBy(desc(payments.month));
}

export async function getPaymentsByMonth(month: string): Promise<Payment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(payments).where(eq(payments.month, month));
}

export async function getCurrentMonthPayment(studentId: number, month: string): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(
    and(eq(payments.studentId, studentId), eq(payments.month, month))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPayment(data: {
  studentId: number;
  classId: number;
  amount: string;
  month: string;
  dueDate?: string;
  notes?: string;
}): Promise<Payment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  const id = (result as any).insertId;
  const payment = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  if (payment.length === 0) throw new Error("Failed to create payment");
  return payment[0];
}

export async function updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set(data).where(eq(payments.id, id));
  const payment = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  if (payment.length === 0) throw new Error("Failed to update payment");
  return payment[0];
}

export async function deletePayment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(payments).where(eq(payments.id, id));
}

// ============= EXAM RESULT QUERIES =============

export async function getResultsByStudent(studentId: number): Promise<ExamResult[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(examResults).where(eq(examResults.studentId, studentId)).orderBy(desc(examResults.examDate));
}

export async function getResultsByClass(classId: number): Promise<ExamResult[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(examResults).where(eq(examResults.classId, classId)).orderBy(desc(examResults.examDate));
}

export async function getLatestResult(studentId: number): Promise<ExamResult | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(examResults)
    .where(eq(examResults.studentId, studentId))
    .orderBy(desc(examResults.examDate))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createExamResult(data: {
  studentId: number;
  classId: number;
  examName: string;
  score: string;
  totalMarks: string;
  percentage?: string;
  grade?: string;
  examDate: string;
  remarks?: string;
}): Promise<ExamResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(examResults).values(data);
  const id = (result as any).insertId;
  const examResult = await db.select().from(examResults).where(eq(examResults.id, id)).limit(1);
  if (examResult.length === 0) throw new Error("Failed to create exam result");
  return examResult[0];
}

export async function updateExamResult(id: number, data: Partial<ExamResult>): Promise<ExamResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(examResults).set(data).where(eq(examResults.id, id));
  const examResult = await db.select().from(examResults).where(eq(examResults.id, id)).limit(1);
  if (examResult.length === 0) throw new Error("Failed to update exam result");
  return examResult[0];
}

export async function deleteExamResult(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(examResults).where(eq(examResults.id, id));
}

// ============= NOTIFICATION QUERIES =============

export async function createNotification(data: {
  studentId: number;
  type: "fee_added" | "payment_status_changed" | "result_published";
  subject: string;
  message: string;
  relatedPaymentId?: number;
  relatedResultId?: number;
}): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(data);
  const id = (result as any).insertId;
  const notification = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  if (notification.length === 0) throw new Error("Failed to create notification");
  return notification[0];
}

export async function getUnsentNotifications(): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications).where(eq(notifications.sent, false));
}

export async function updateNotificationSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ sent: true, sentAt: new Date() }).where(eq(notifications.id, id));
}
