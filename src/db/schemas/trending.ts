import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { repos } from './repos';

export const trending_repos = pgTable(
  'trending_repos',
  {
    id: serial('id').primaryKey(),
    repo_id: integer('repo_id')
      .notNull()
      .references(() => repos.id),
    period: varchar('period', { length: 50 }).notNull(), // 'daily', 'weekly'
    stars_earned: integer().notNull().default(0),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    pk: uniqueIndex('repo_period_idx').on(table.repo_id, table.period),
  })
);

export const trendingRelations = relations(trending_repos, ({ one }) => ({
  repo: one(repos, {
    fields: [trending_repos.repo_id],
    references: [repos.id],
  }),
}));
