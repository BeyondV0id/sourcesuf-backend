import { db } from '../db/client';
import { tracked_prs } from '../db/schemas/tracked-prs';
import { eq, desc, and, InferInsertModel } from 'drizzle-orm';

type TrackedPRInsert = typeof tracked_prs.$inferInsert;

export type UpdateUserFields = {
  note?: TrackedPRInsert['note'];
  priority?: TrackedPRInsert['priority'];
};

export type UpdateSystemFields = {
  title?: TrackedPRInsert['title'];
  state?: TrackedPRInsert['state'];
  opened_at?: TrackedPRInsert['opened_at'];
  merged_at?: TrackedPRInsert['merged_at'];
  closed_at?: TrackedPRInsert['closed_at'];
  additions?: TrackedPRInsert['additions'];
  deletions?: TrackedPRInsert['deletions'];
  changed_files?: TrackedPRInsert['changed_files'];
  last_synced_at?: TrackedPRInsert['last_synced_at'];
};
export const prService = {
  getAll: async (userId: string) => {
    return await db
      .select()
      .from(tracked_prs)
      .where(eq(tracked_prs.user_id, userId))
      .orderBy(desc(tracked_prs.created_at));
  },

  findById: async (id: number, userId: string) => {
    const result = await db
      .select()
      .from(tracked_prs)
      .where(and(eq(tracked_prs.id, id), eq(tracked_prs.user_id, userId)))
      .limit(1);
    return result[0] ?? null;
  },

  create: async (data: TrackedPRInsert) => {
    const result = await db
      .insert(tracked_prs)
      .values(data)
      .onConflictDoUpdate({
        target: [tracked_prs.user_id, tracked_prs.html_url],
        set: {
          last_synced_at: new Date(),
        },
      })
      .returning();
    return result[0] ?? null;
  },

  updateUserField: async (
    id: number,
    userId: string,
    fields: UpdateUserFields
  ) => {
    const result = await db
      .update(tracked_prs)
      .set(fields)
      .where(and(eq(tracked_prs.id, id), eq(tracked_prs.user_id, userId)))
      .returning();
    return result[0] ?? null;
  },

  updateSystemFields: async (
    id: number,
    userId: string,
    fields: UpdateSystemFields
  ) => {
    const result = await db
      .update(tracked_prs)
      .set(fields)
      .where(and(eq(tracked_prs.id, id), eq(tracked_prs.user_id, userId)))
      .returning();
    return result[0] ?? null;
  },

  delete: async (id: number, userId: string) => {
    return await db
      .delete(tracked_prs)
      .where(and(eq(tracked_prs.id, id), eq(tracked_prs.user_id, userId)));
  },
};
