CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`details` text,
	`occurred_at` integer NOT NULL,
	CONSTRAINT "audit_log_action_check" CHECK("action" IN ('auth.bootstrap', 'auth.sign_in', 'auth.passkey_added', 'auth.passkey_renamed', 'auth.passkey_deleted', 'auth.password_changed', 'auth.sessions_revoked', 'order.void', 'sync.conflict', 'catalog.price_changed', 'catalog.cost_changed', 'expense.updated', 'expense.deleted', 'profile.updated', 'device.registered', 'device.updated', 'device.revoked')),
	CONSTRAINT "audit_log_details_check" CHECK("details" IS NULL OR (json_valid("details") AND json_type("details") = 'object'))
);
--> statement-breakpoint
CREATE INDEX `audit_log_occurred_at_idx` ON `audit_log` (`occurred_at`);--> statement-breakpoint
CREATE TABLE `business_profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`ticket_header` text,
	`ticket_footer` text,
	`print_customer_ticket` integer DEFAULT true NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "business_profile_single_row_check" CHECK("id" = 1)
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`archived_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `device` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`label` text NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen_at` integer,
	`revoked_at` integer,
	CONSTRAINT "device_code_check" CHECK("code" GLOB '[A-Z]')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_active_code_unique` ON `device` (`code`) WHERE "revoked_at" IS NULL;--> statement-breakpoint
CREATE TABLE `expense` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text,
	`category` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`description` text NOT NULL,
	`supplier` text,
	`spent_at` integer NOT NULL,
	`business_date` text NOT NULL,
	`payload_hash` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`device_id`) REFERENCES `device`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "expense_category_check" CHECK("category" IN ('supplies', 'packaging', 'utilities', 'other')),
	CONSTRAINT "expense_amount_cents_check" CHECK("amount_cents" > 0),
	CONSTRAINT "expense_business_date_check" CHECK("business_date" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')
);
--> statement-breakpoint
CREATE INDEX `expense_business_date_idx` ON `expense` (`business_date`);--> statement-breakpoint
CREATE TABLE `option_group` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `option_group_product_id_idx` ON `option_group` (`product_id`);--> statement-breakpoint
CREATE TABLE `option_value` (
	`id` text PRIMARY KEY NOT NULL,
	`option_group_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`option_group_id`) REFERENCES `option_group`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `option_value_option_group_id_idx` ON `option_value` (`option_group_id`);--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`folio_seq` integer NOT NULL,
	`folio` text NOT NULL,
	`business_date` text NOT NULL,
	`channel` text NOT NULL,
	`payment_method` text NOT NULL,
	`total_cents` integer NOT NULL,
	`estimated_cost_cents` integer,
	`cash_received_cents` integer,
	`change_cents` integer,
	`external_ref` text,
	`customer_name` text,
	`note` text,
	`flags` text DEFAULT '[]' NOT NULL,
	`sold_at` integer NOT NULL,
	`received_at` integer NOT NULL,
	`payload_hash` text NOT NULL,
	`voided_at` integer,
	`void_reason` text,
	FOREIGN KEY (`device_id`) REFERENCES `device`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_folio_seq_check" CHECK("folio_seq" > 0),
	CONSTRAINT "order_business_date_check" CHECK("business_date" GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "order_channel_check" CHECK("channel" IN ('counter', 'didi_food')),
	CONSTRAINT "order_payment_method_check" CHECK("payment_method" IN ('cash', 'card_terminal', 'didi_food')),
	CONSTRAINT "order_payment_for_channel_check" CHECK(("channel" = 'counter' AND "payment_method" IN ('cash', 'card_terminal')) OR ("channel" = 'didi_food' AND "payment_method" IN ('didi_food'))),
	CONSTRAINT "order_total_cents_check" CHECK("total_cents" >= 0),
	CONSTRAINT "order_estimated_cost_cents_check" CHECK("estimated_cost_cents" IS NULL OR "estimated_cost_cents" >= 0),
	CONSTRAINT "order_cash_fields_check" CHECK(CASE WHEN "payment_method" = 'cash' THEN "cash_received_cents" IS NOT NULL
    AND "cash_received_cents" >= "total_cents"
    AND "change_cents" = "cash_received_cents" - "total_cents"
    ELSE "cash_received_cents" IS NULL AND "change_cents" IS NULL END),
	CONSTRAINT "order_external_ref_check" CHECK("external_ref" IS NULL OR "channel" = 'didi_food'),
	CONSTRAINT "order_flags_check" CHECK(json_valid("flags") AND json_type("flags") = 'array'),
	CONSTRAINT "order_void_fields_check" CHECK(("voided_at" IS NULL) = ("void_reason" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_device_id_business_date_folio_seq_unique` ON `order` (`device_id`,`business_date`,`folio_seq`);--> statement-breakpoint
CREATE INDEX `order_business_date_idx` ON `order` (`business_date`);--> statement-breakpoint
CREATE TABLE `order_item` (
	`order_id` text NOT NULL,
	`line_number` integer NOT NULL,
	`variant_id` text NOT NULL,
	`product_name` text NOT NULL,
	`variant_label` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`line_total_cents` integer NOT NULL,
	`unit_cost_cents` integer,
	`note` text,
	PRIMARY KEY(`order_id`, `line_number`),
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `variant`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_item_line_number_check" CHECK("line_number" > 0),
	CONSTRAINT "order_item_quantity_check" CHECK("quantity" > 0),
	CONSTRAINT "order_item_unit_price_cents_check" CHECK("unit_price_cents" >= 0),
	CONSTRAINT "order_item_line_total_cents_check" CHECK("line_total_cents" = "unit_price_cents" * "quantity"),
	CONSTRAINT "order_item_unit_cost_cents_check" CHECK("unit_cost_cents" IS NULL OR "unit_cost_cents" >= 0)
);
--> statement-breakpoint
CREATE INDEX `order_item_variant_id_idx` ON `order_item` (`variant_id`);--> statement-breakpoint
CREATE TABLE `order_void` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`device_id` text NOT NULL,
	`reason` text NOT NULL,
	`voided_at` integer NOT NULL,
	`received_at` integer NOT NULL,
	`payload_hash` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `device`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_void_reason_check" CHECK(length(trim("reason")) > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_void_order_id_unique` ON `order_void` (`order_id`);--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`archived_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `product_category_id_idx` ON `product` (`category_id`);--> statement-breakpoint
CREATE TABLE `variant` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`archived_at` integer,
	`estimated_cost_cents` integer,
	`cost_source` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "variant_estimated_cost_cents_check" CHECK("estimated_cost_cents" IS NULL OR "estimated_cost_cents" >= 0),
	CONSTRAINT "variant_cost_source_check" CHECK("cost_source" IN ('manual', 'suggested')),
	CONSTRAINT "variant_cost_known_with_source_check" CHECK(("estimated_cost_cents" IS NULL) = ("cost_source" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `variant_product_id_idx` ON `variant` (`product_id`);--> statement-breakpoint
CREATE TABLE `variant_option_value` (
	`variant_id` text NOT NULL,
	`option_value_id` text NOT NULL,
	PRIMARY KEY(`variant_id`, `option_value_id`),
	FOREIGN KEY (`variant_id`) REFERENCES `variant`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`option_value_id`) REFERENCES `option_value`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `variant_option_value_option_value_id_idx` ON `variant_option_value` (`option_value_id`);--> statement-breakpoint
CREATE TABLE `variant_price` (
	`variant_id` text NOT NULL,
	`channel` text NOT NULL,
	`price_cents` integer NOT NULL,
	`is_placeholder` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`variant_id`, `channel`),
	FOREIGN KEY (`variant_id`) REFERENCES `variant`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "variant_price_channel_check" CHECK("channel" IN ('counter', 'didi_food')),
	CONSTRAINT "variant_price_price_cents_check" CHECK("price_cents" >= 0)
);
