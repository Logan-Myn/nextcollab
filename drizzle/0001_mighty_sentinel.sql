CREATE TABLE "discovered_creator" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instagram_username" text NOT NULL,
	"full_name" text,
	"bio" text,
	"followers" integer,
	"following" integer,
	"posts_count" integer,
	"niche" text,
	"is_verified" boolean DEFAULT false,
	"profile_picture" text,
	"external_url" text,
	"partnership_count" integer DEFAULT 0,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discovered_creator_instagram_username_unique" UNIQUE("instagram_username")
);
--> statement-breakpoint
ALTER TABLE "brand" ADD COLUMN "typical_creator_niches" jsonb;--> statement-breakpoint
ALTER TABLE "brand" ADD COLUMN "avg_creator_followers" integer;--> statement-breakpoint
ALTER TABLE "brand" ADD COLUMN "preferred_post_types" jsonb;--> statement-breakpoint
ALTER TABLE "partnership" ADD COLUMN "discovered_creator_id" uuid;--> statement-breakpoint
ALTER TABLE "partnership" ADD COLUMN "creator_niche" text;--> statement-breakpoint
ALTER TABLE "partnership" ADD COLUMN "creator_followers" integer;--> statement-breakpoint
ALTER TABLE "partnership" ADD CONSTRAINT "partnership_discovered_creator_id_discovered_creator_id_fk" FOREIGN KEY ("discovered_creator_id") REFERENCES "public"."discovered_creator"("id") ON DELETE set null ON UPDATE no action;