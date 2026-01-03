CREATE TABLE "yc_repos" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"url" varchar NOT NULL,
	"description" varchar NOT NULL,
	"star_count" integer NOT NULL,
	"watchers_count" integer NOT NULL,
	"forks_count" integer NOT NULL,
	"open_issue_count" integer NOT NULL
);
