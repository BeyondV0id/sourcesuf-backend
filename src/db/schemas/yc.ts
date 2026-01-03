import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

export const yc_repos = pgTable("yc_repos",{
  id: serial("id").primaryKey(),
  name: varchar("name",{length:128}).notNull(),
  url:varchar("url").notNull(),
  description:varchar("description").notNull(),
  star_count:integer("star_count").notNull(),
  watchers_count:integer("watchers_count").notNull(),
  forks_count: integer("forks_count").notNull(),
  open_issue_count:integer("open_issue_count").notNull(),
})
