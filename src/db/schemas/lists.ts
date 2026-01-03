import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), 
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listRepos = pgTable("list_repos", {
  id: uuid("id").defaultRandom().primaryKey(),
  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  repoFullName: text("repo_full_name").notNull(), // e.g. "owner/name"
  userNotes: text("user_notes"),
  position: integer("position").default(0),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(user, {
    fields: [lists.userId],
    references: [user.id],
  }),
  repos: many(listRepos),
}));

export const listReposRelations = relations(listRepos, ({ one }) => ({
  list: one(lists, {
    fields: [listRepos.listId],
    references: [lists.id],
  }),
}));
