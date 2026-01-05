import {
  pgTable,
  primaryKey,
  integer,
  serial,
  boolean,
  timestamp,
  text,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const repos = pgTable(
  'repos',
  {
    id: serial('id').primaryKey(),
    github_id: integer('github_id').notNull().unique(),
    owner: varchar('owner', { length: 256 }).notNull(),
    repo_name: varchar('repo_name', { length: 256 }).notNull(),
    full_name: varchar('full_name', { length: 256 }).notNull(),
    url: varchar('url', { length: 512 }).notNull(),
    description: text('description'),
    language: varchar('language', { length: 100 }),
    stargazers_count: integer('stargazers_count').notNull().default(0),
    forks_count: integer('forks_Count').notNull().default(0),
    watchers_count: integer('watchers_count').notNull().default(0),
    open_issues_count: integer('open_issue_count').notNull().default(0),
    is_yc: boolean('is_yc').default(false),
    created_at: timestamp('created_at'),
    updated_at: timestamp('updated_at'),
    last_synced_at: timestamp('last_sycned_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      full_name_indx: uniqueIndex('full_name_indx').on(table.full_name),
    };
  }
);

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export const repo_to_tags = pgTable(
  'repo_to_tags',
  {
    repo_id: integer('repo_id')
      .notNull()
      .references(() => repos.id),
    tag_id: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.repo_id, table.tag_id] }),
  })
);
