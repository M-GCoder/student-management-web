import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getStudentByStudentId,
  getStudentById,
  getAllStudents,
  getStudentsByClass,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getEnrollmentsByStudent,
  getEnrollmentsByClass,
  createEnrollment,
  getPaymentsByStudent,
  getCurrentMonthPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getResultsByStudent,
  getLatestResult,
  createExamResult,
  updateExamResult,
  deleteExamResult,
  createNotification,
  getPaymentsByMonth,
  getResultsByClass,
} from "./db";
import { hashPassword, verifyPassword, generateStudentId } from "./auth";
import {
  sendFeeNotification,
  sendPaymentStatusNotification,
  sendResultNotification,
} from "./email";

// ============= STUDENT LOGIN PROCEDURE =============

export const studentLoginProcedure = publicProcedure
  .input(z.object({
    studentId: z.string().min(1, "Student ID is required"),
    password: z.string().min(1, "Password is required"),
  }))
  .mutation(async ({ input, ctx }) => {
    const student = await getStudentByStudentId(input.studentId);
    
    if (!student) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid student ID or password",
      });
    }

    if (student.status !== "active") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Student account is not active",
      });
    }

    const passwordValid = verifyPassword(input.password, student.passwordHash);
    
    if (!passwordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid student ID or password",
      });
    }

    // Set session cookie
    const cookieOptions = getSessionCookieOptions(ctx.req);
    const sessionData = JSON.stringify({
      studentId: student.id,
      type: "student",
    });
    ctx.res.cookie(COOKIE_NAME, sessionData, cookieOptions);

    return {
      success: true,
      student: {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
    };
  });

// ============= ADMIN LOGIN PROCEDURE =============

export const adminLoginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required"),
  }))
  .mutation(async ({ input, ctx }) => {
    // For admin login, we'll use the Manus OAuth system
    // This is a placeholder that would be replaced with actual admin authentication
    throw new TRPCError({
      code: "NOT_IMPLEMENTED",
      message: "Admin login uses Manus OAuth system",
    });
  });

// ============= ADMIN PROCEDURES =============

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  // TODO: Implement admin role check
  // For now, we'll allow all procedures
  return next({ ctx });
});

// ============= STUDENT MANAGEMENT ROUTERS =============

const studentManagementRouter = router({
  // Get all students
  list: adminProcedure.query(async () => {
    return await getAllStudents();
  }),

  // Get students by class
  byClass: adminProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      return await getStudentsByClass(input.classId);
    }),

  // Get student by ID
  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getStudentById(input.id);
    }),

  // Create student
  create: adminProcedure
    .input(z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Valid email is required"),
      phone: z.string().optional(),
      password: z.string().min(6, "Password must be at least 6 characters"),
      dateOfBirth: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const studentId = generateStudentId();
      const passwordHash = hashPassword(input.password);

      const student = await createStudent({
        studentId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        passwordHash,
        dateOfBirth: input.dateOfBirth,
        address: input.address,
      });

      return {
        ...student,
        studentId: student.studentId,
        generatedPassword: input.password, // Return password only on creation
      };
    }),

  // Update student
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      status: z.enum(["active", "inactive", "graduated"]).optional(),
      classId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateStudent(id, data);
    }),

  // Update student password
  updatePassword: adminProcedure
    .input(z.object({
      id: z.number(),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
    }))
    .mutation(async ({ input }) => {
      const passwordHash = hashPassword(input.newPassword);
      return await updateStudent(input.id, { passwordHash });
    }),

  // Delete student
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteStudent(input.id);
      return { success: true };
    }),
});

// ============= CLASS MANAGEMENT ROUTERS =============

const classManagementRouter = router({
  // Get all classes
  list: adminProcedure.query(async () => {
    return await getAllClasses();
  }),

  // Get class by ID
  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getClassById(input.id);
    }),

  // Create class
  create: adminProcedure
    .input(z.object({
      className: z.string().min(1, "Class name is required"),
      description: z.string().optional(),
      instructor: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      capacity: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return await createClass(input);
    }),

  // Update class
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      className: z.string().optional(),
      description: z.string().optional(),
      instructor: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      capacity: z.number().optional(),
      status: z.enum(["active", "inactive", "completed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateClass(id, data);
    }),

  // Delete class
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteClass(input.id);
      return { success: true };
    }),

  // Enroll student in class
  enrollStudent: adminProcedure
    .input(z.object({
      studentId: z.number(),
      classId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await createEnrollment(input.studentId, input.classId);
    }),

  // Get students in class
  getStudents: adminProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      return await getEnrollmentsByClass(input.classId);
    }),
});

// ============= PAYMENT MANAGEMENT ROUTERS =============

const paymentManagementRouter = router({
  // Get payments for student
  byStudent: adminProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await getPaymentsByStudent(input.studentId);
    }),

  // Get payments for month
  byMonth: adminProcedure
    .input(z.object({ month: z.string() }))
    .query(async ({ input }) => {
      return await getPaymentsByMonth(input.month);
    }),

  // Create payment
  create: adminProcedure
    .input(z.object({
      studentId: z.number(),
      classId: z.number(),
      amount: z.string(),
      month: z.string(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const student = await getStudentById(input.studentId);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      const payment = await createPayment(input);

      // Send notification email
      await sendFeeNotification(
        student.email,
        `${student.firstName} ${student.lastName}`,
        (await getClassById(input.classId))?.className || "Unknown Class",
        input.amount,
        input.dueDate || "Not specified"
      );

      // Create notification record
      await createNotification({
        studentId: input.studentId,
        type: "fee_added",
        subject: "New Fee Record Added",
        message: `A new fee of ${input.amount} has been added for ${input.month}`,
        relatedPaymentId: payment.id,
      });

      return payment;
    }),

  // Update payment status
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "paid", "overdue"]),
      paidDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const payment = await updatePayment(input.id, {
        status: input.status,
        paidDate: input.paidDate,
      });

      const student = await getStudentById(payment.studentId);
      if (student) {
        await sendPaymentStatusNotification(
          student.email,
          `${student.firstName} ${student.lastName}`,
          input.status,
          payment.amount.toString(),
          payment.month
        );

        await createNotification({
          studentId: payment.studentId,
          type: "payment_status_changed",
          subject: "Payment Status Updated",
          message: `Your payment status for ${payment.month} has been updated to ${input.status}`,
          relatedPaymentId: payment.id,
        });
      }

      return payment;
    }),

  // Delete payment
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deletePayment(input.id);
      return { success: true };
    }),
});

// ============= EXAM RESULTS ROUTERS =============

const resultsManagementRouter = router({
  // Get results for student
  byStudent: adminProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await getResultsByStudent(input.studentId);
    }),

  // Get results for class
  byClass: adminProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      return await getResultsByClass(input.classId);
    }),

  // Create exam result
  create: adminProcedure
    .input(z.object({
      studentId: z.number(),
      classId: z.number(),
      examName: z.string().min(1, "Exam name is required"),
      score: z.string(),
      totalMarks: z.string(),
      percentage: z.string().optional(),
      grade: z.string().optional(),
      examDate: z.string(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await createExamResult(input);
    }),

  // Publish results for class (bulk)
  publishForClass: adminProcedure
    .input(z.object({
      classId: z.number(),
      examName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const results = await getResultsByClass(input.classId);
      const classData = await getClassById(input.classId);

      // Update all results with publishedDate
      const publishedDate = new Date().toISOString().split('T')[0];
      for (const result of results) {
        if (result.examName === input.examName) {
          await updateExamResult(result.id, { publishedDate });

          // Send notification email
          const student = await getStudentById(result.studentId);
          if (student) {
            await sendResultNotification(
              student.email,
              `${student.firstName} ${student.lastName}`,
              result.examName,
              result.score.toString(),
              result.totalMarks.toString(),
              result.percentage?.toString() || "N/A",
              result.grade || "N/A"
            );

            await createNotification({
              studentId: result.studentId,
              type: "result_published",
              subject: "Exam Results Published",
              message: `Your results for ${result.examName} have been published`,
              relatedResultId: result.id,
            });
          }
        }
      }

      return { success: true, published: results.length };
    }),

  // Update result
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      score: z.string().optional(),
      percentage: z.string().optional(),
      grade: z.string().optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateExamResult(id, data);
    }),

  // Delete result
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteExamResult(input.id);
      return { success: true };
    }),
});

// ============= STUDENT PORTAL ROUTERS =============

const studentPortalRouter = router({
  // Student login
  login: studentLoginProcedure,

  // Get current student info
  me: publicProcedure.query(async ({ ctx }) => {
    // TODO: Extract student ID from session cookie
    return null;
  }),

  // Get current month payment status
  getCurrentMonthFee: publicProcedure
    .input(z.object({ studentId: z.number(), month: z.string() }))
    .query(async ({ input }) => {
      const payment = await getCurrentMonthPayment(input.studentId, input.month);
      return payment ?? null;
    }),

  // Get payment history
  getPaymentHistory: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const payments = await getPaymentsByStudent(input.studentId);
      return payments ?? [];
    }),

  // Get latest exam result
  getLatestResult: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const result = await getLatestResult(input.studentId);
      return result ?? null;
    }),

  // Get all exam results
  getAllResults: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const results = await getResultsByStudent(input.studentId);
      return results ?? [];
    }),

  // Get student enrollments
  getEnrollments: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const enrollments = await getEnrollmentsByStudent(input.studentId);
      return enrollments ?? [];
    }),
});

// ============= MAIN ROUTER =============

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  students: studentManagementRouter,
  classes: classManagementRouter,
  payments: paymentManagementRouter,
  results: resultsManagementRouter,
  portal: studentPortalRouter,
});

export type AppRouter = typeof appRouter;
