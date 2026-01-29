import { db } from '../db/client';
import { tracked_issues } from '../db/schemas/tracked-issues';
import { eq, desc, and, InferInsertModel } from 'drizzle-orm';

export type NewTrackedIssue = InferInsertModel<typeof tracked_issues>;
export type updateSystemFields = Partial<Pick<NewTrackedIssue, 'title' | 'state' | 'last_synced_at'>>;

export const issueService = {
  getAll: async (userId: string) => {
    return await db
      .select()
      .from(tracked_issues)
      .where(eq(tracked_issues.user_id, userId))
      .orderBy(desc(tracked_issues.created_at));
  },

  findById: async (id: number, userId: string) => {
    const result = await db
      .select()
      .from(tracked_issues)
      .where(and(eq(tracked_issues.id, id), eq(tracked_issues.user_id, userId)))
      .limit(1);
    return result[0] ?? null;
  },

  create: async (data: NewTrackedIssue) => {
    const result = await db
      .insert(tracked_issues)
      .values(data)
      .onConflictDoUpdate({
        target: [tracked_issues.user_id, tracked_issues.html_url],
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
    fields: Partial<Pick<NewTrackedIssue, 'note' | 'priority'>>
  ) => {
    const result = await db
      .update(tracked_issues)
      .set(fields)
      .where(and(eq(tracked_issues.id, id), eq(tracked_issues.user_id, userId)))
      .returning();
    return result[0] ?? null;
  },

  updateSystemFields: async (
    id: number,
    userId: string,
    fields: updateSystemFields
  ) => {
    const result = await db
      .update(tracked_issues)
      .set(fields)
      .where(and(eq(tracked_issues.id, id), eq(tracked_issues.user_id, userId)))
      .returning();
    return result[0] ?? null;
  },

  delete: async (id: number, userId: string) => {
    return await db
      .delete(tracked_issues)
      .where(and(eq(tracked_issues.id, id), eq(tracked_issues.user_id, userId)));
  },
};
