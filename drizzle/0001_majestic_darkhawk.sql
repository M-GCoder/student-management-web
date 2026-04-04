CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`className` varchar(100) NOT NULL,
	`description` text,
	`instructor` varchar(100),
	`startDate` varchar(10),
	`endDate` varchar(10),
	`capacity` int,
	`status` enum('active','inactive','completed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`classId` int NOT NULL,
	`enrollmentDate` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','completed','dropped') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `examResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`classId` int NOT NULL,
	`examName` varchar(100) NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`totalMarks` decimal(5,2) NOT NULL,
	`percentage` decimal(5,2),
	`grade` varchar(2),
	`examDate` varchar(10) NOT NULL,
	`publishedDate` varchar(10),
	`remarks` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `examResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`type` enum('fee_added','payment_status_changed','result_published') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`sent` boolean NOT NULL DEFAULT false,
	`sentAt` timestamp,
	`relatedPaymentId` int,
	`relatedResultId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`classId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`month` varchar(7) NOT NULL,
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	`dueDate` varchar(10),
	`paidDate` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` varchar(50) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`passwordHash` text NOT NULL,
	`classId` int,
	`status` enum('active','inactive','graduated') NOT NULL DEFAULT 'active',
	`dateOfBirth` varchar(10),
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_studentId_unique` UNIQUE(`studentId`),
	CONSTRAINT `studentId_idx` UNIQUE(`studentId`)
);
--> statement-breakpoint
CREATE INDEX `enrollment_studentId_idx` ON `enrollments` (`studentId`);--> statement-breakpoint
CREATE INDEX `enrollment_classId_idx` ON `enrollments` (`classId`);--> statement-breakpoint
CREATE INDEX `result_studentId_idx` ON `examResults` (`studentId`);--> statement-breakpoint
CREATE INDEX `result_classId_idx` ON `examResults` (`classId`);--> statement-breakpoint
CREATE INDEX `result_examDate_idx` ON `examResults` (`examDate`);--> statement-breakpoint
CREATE INDEX `notification_studentId_idx` ON `notifications` (`studentId`);--> statement-breakpoint
CREATE INDEX `payment_studentId_idx` ON `payments` (`studentId`);--> statement-breakpoint
CREATE INDEX `payment_classId_idx` ON `payments` (`classId`);--> statement-breakpoint
CREATE INDEX `payment_month_idx` ON `payments` (`month`);--> statement-breakpoint
CREATE INDEX `classId_idx` ON `students` (`classId`);