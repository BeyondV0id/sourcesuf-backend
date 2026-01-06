import { pgTable, integer, serial,uniqueIndex ,varchar,timestamp} from 'drizzle-orm/pg-core';
import {repos} from './repos';
export const trending_repos = pgTable('trending_repos', {
  id: serial('id').primaryKey(),
  repo_id:integer('repo_id').notNull().references(()=>repos.id),
  period:varchar('period',{length:50}).notNull(),
  created_at:timestamp('created_at').defaultNow(),
},  
  (t)=>({
    pk:uniqueIndex('repo_period_index').on(t.repo_id,t.period),
  })
);
