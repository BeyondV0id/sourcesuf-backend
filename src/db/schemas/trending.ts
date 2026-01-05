import { pgTable, integer, serial } from 'drizzle-orm/pg-core';

export const trending_repos = pgTable('trending_repos', {
  id: serial('id').primaryKey(),
});
