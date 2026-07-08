CREATE TABLE `contact_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`friend_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`direction` text NOT NULL,
	`channel` text,
	`note` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`friend_id`) REFERENCES `friends`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_contact_logs_friend_ts` ON `contact_logs` (`friend_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `friends` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tag` text NOT NULL,
	`plant_type` text NOT NULL,
	`cadence_days` integer NOT NULL,
	`phone` text,
	`email` text,
	`bio` text,
	`birthday_month` integer,
	`birthday_day` integer,
	`birthday_year` integer,
	`location` text,
	`low_touch` integer DEFAULT false NOT NULL,
	`snooze_until` text,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`friend_id` text NOT NULL,
	`body` text NOT NULL,
	`tag` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`friend_id`) REFERENCES `friends`(`id`) ON UPDATE no action ON DELETE no action
);
