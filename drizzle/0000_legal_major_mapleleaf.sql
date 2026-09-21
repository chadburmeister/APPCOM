CREATE TABLE "calls" (
	"id" text PRIMARY KEY NOT NULL,
	"rep_name" text NOT NULL,
	"account_name" text NOT NULL,
	"call_date" timestamp with time zone NOT NULL,
	"recording_url" text,
	"context" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scorecards" (
	"id" text PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"scorer_id" text NOT NULL,
	"acceptance_score" integer NOT NULL,
	"acceptance_notes" text,
	"purpose_score" integer NOT NULL,
	"purpose_stated_early" boolean,
	"purpose_notes" text,
	"probing_score" integer NOT NULL,
	"qual_question_1" text,
	"qual_question_2" text,
	"qual_question_3" text,
	"uncovered_challenges" boolean,
	"uncovered_cost_of_inaction" boolean,
	"uncovered_ideal_solution" boolean,
	"understood_buying_process" boolean,
	"probing_notes" text,
	"consulting_score" integer NOT NULL,
	"consulting_notes" text,
	"objections_score" integer NOT NULL,
	"objections_notes" text,
	"motivate_score" integer NOT NULL,
	"motivate_notes" text,
	"overall_rating" integer NOT NULL,
	"overall_notes" text,
	"submitted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scorecards" ADD CONSTRAINT "scorecards_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scorecards" ADD CONSTRAINT "scorecards_scorer_id_users_id_fk" FOREIGN KEY ("scorer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "scorecards_call_scorer_idx" ON "scorecards" USING btree ("call_id","scorer_id");