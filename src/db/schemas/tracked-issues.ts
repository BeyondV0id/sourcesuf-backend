import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const tracked_issues = pgTable(
  'tracked_issues',
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

    title: text('title').notNull(),
    state: text('state').notNull(),
    author: text('author').notNull(),

    note: text('note').default(''),
    priority: text('priority').default('none'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    last_synced_at: timestamp('last_synced_at').defaultNow().notNull(),
  },
  (table) => ({
    unique_user_issue: uniqueIndex('unique_user_issue').on(
      table.user_id,
      table.html_url
    ),
  })
);
