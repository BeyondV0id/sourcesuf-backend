import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const tracked_prs = pgTable(
  'tracked_prs',
  {
    id: serial('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
      }),

    repo_owner: text('repo_owner').notNull(),
    repo_name: text('repo_name').notNull(),
    number: integer('number').notNull(),
    html_url: text('html_url').notNull(),

    additions: integer('additions').default(0),
    deletions: integer('deletions').default(0),
    changed_files: integer('changed_files').default(0),

    title: text('title').notNull(),
    state: text('state').notNull(),
    author: text('author').notNull(),

    note: text('note').default(''),
    priority: text('priority').default('none'),

    opened_at: timestamp('opened_at').defaultNow().notNull(),
    merged_at: timestamp('merged_at'),
    closed_at: timestamp('closed_at'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    last_synced_at: timestamp('last_synced_at').defaultNow().notNull(),
  },
  (table) => ({
    unique_user_pr: uniqueIndex('unique_user_pr').on(
      table.user_id,
      table.html_url
    ),
  })
);
