-- Migration number: 0000_initial

CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo_url` text DEFAULT ''
);

CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '',
	`price` integer NOT NULL,
	`gender` text NOT NULL DEFAULT 'unisex',
	`colors` text NOT NULL DEFAULT '[]',
	`image_urls` text NOT NULL DEFAULT '[]',
	`size_stock` text NOT NULL DEFAULT '{}'
);

CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`delivery_address` text NOT NULL,
	`cart_items_summary` text NOT NULL,
	`total_price` integer NOT NULL,
	`status` text NOT NULL DEFAULT 'pending_payment',
	`created_at` integer NOT NULL
);
