import { db } from '../db/client';
import { tracked_prs } from '@/db/schemas/trackedPRs';
import { eq, desc, and, InferInsertModel } from 'drizzle-orm';

export type NewTrackedPR = InferInsertModel<typeof tracked_prs>;

export const prService = {
  getAll: async (userId: string) => {
    return await db
      .select()
      .from(tracked_prs)
      .where(eq(tracked_prs.user_id, userId))
      .orderBy(desc(tracked_prs.created_at));
  },

  findById: async (id: string, userId: string) => {
    const result = await db
      .select()
      .from(tracked_prs)
      .where(and(eq(tracked_prs.user_id, userId), eq(tracked_prs.id, id)))
      .limit(1);
    return result[0] ?? null;
  },

  create: async (data: NewTrackedPR) => {
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
    id: string,
    userId: string,
    fields: Partial<Pick<NewTrackedPR, 'note' | 'priority'>>
  ) => {
    const result = await db
      .update(tracked_prs)
      .set(fields)
      .where(and(eq(tracked_prs.id, id), eq(tracked_prs.user_id, userId)))
      .returning();
    return result[0] ?? null;
  },

  updateSystemFields: async (
    id: string,
    fields: Partial<Pick<NewTrackedPR, 'title' | 'state'>>
  ) => {
    const result = await db
      .update(tracked_prs)
      .set(fields)
      .where(eq(tracked_prs.id, id))
      .returning();
    return result[0] ?? null;
  },

  delete: async (id: string, userId: string) => {
    return await db
      .delete(tracked_prs)
      .where(and(eq(tracked_prs.id, id), eq(tracked_prs.user_id, userId)));
  },
};
