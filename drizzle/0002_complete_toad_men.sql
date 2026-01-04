CREATE TABLE "repo_to_tags" (
	"repo_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "repo_to_tags_repo_id_tag_id_pk" PRIMARY KEY("repo_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "repos" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_id" integer NOT NULL,
	"owner" varchar(256) NOT NULL,
	"repo_name" varchar(256) NOT NULL,
	"full_name" varchar(256) NOT NULL,
	"url" varchar(512) NOT NULL,
	"description" text,
	"stargazers_count" integer DEFAULT 0 NOT NULL,
	"forks_Count" integer DEFAULT 0 NOT NULL,
	"watchers_count" integer DEFAULT 0 NOT NULL,
	"open_issue_count" integer DEFAULT 0 NOT NULL,
	"is_yc" boolean DEFAULT false,
	"created_at" timestamp,
	"updated_at" timestamp,
	"last_sycned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repos_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "trending_repos" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repo_to_tags" ADD CONSTRAINT "repo_to_tags_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_to_tags" ADD CONSTRAINT "repo_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "full_name_indx" ON "repos" USING btree ("full_name");