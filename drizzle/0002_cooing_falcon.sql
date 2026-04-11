CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text,
	`documentUrl` text,
	`createdBy` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `announcement_classId_idx` ON `announcements` (`classId`);--> statement-breakpoint
CREATE INDEX `announcement_expiresAt_idx` ON `announcements` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `announcement_isActive_idx` ON `announcements` (`isActive`);