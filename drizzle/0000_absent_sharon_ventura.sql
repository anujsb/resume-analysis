CREATE TABLE "analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" serial NOT NULL,
	"skills" jsonb NOT NULL,
	"experience_level" text NOT NULL,
	"work_experience_years" text NOT NULL,
	"summary" text,
	"professional_profile" text,
	"full_resume" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"resume_text" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"remark" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"primary_skills" jsonb NOT NULL,
	"secondary_skills" jsonb NOT NULL,
	"nice_to_have_skills" jsonb NOT NULL,
	"minimum_experience" integer NOT NULL,
	"preferred_experience" integer NOT NULL,
	"experience_level" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company" text,
	"position" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;