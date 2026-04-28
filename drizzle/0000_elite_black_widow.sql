CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`title` text NOT NULL,
	`notes` text,
	`is_done` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`dirty` integer DEFAULT true NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`has_onboarded` integer DEFAULT false NOT NULL,
	`name` text,
	`locale` text DEFAULT 'en' NOT NULL,
	`units_weight` text DEFAULT 'kg' NOT NULL,
	`units_distance` text DEFAULT 'km' NOT NULL,
	`theme_preference` text DEFAULT 'system' NOT NULL,
	`reminder_time` text,
	`notification_consent` integer DEFAULT false NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
