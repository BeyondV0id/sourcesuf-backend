import { db } from '../db/client';
import { tags, repo_to_tags } from '../db/schemas/repos';
import { eq } from 'drizzle-orm';
export async function linkTopicsToRepo(repoId: number, topics: string[]) {
  if (!topics || topics.length === 0) {
    return;
  }

  for (const topic of topics) {
    let tagId: number;
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.name, topic))
      .limit(1);

    if (existing.length > 0) {
      tagId = existing[0].id;
    } else {
      //create new tag
      const newTag = await db.insert(tags).values({ name: topic }).returning({
        id: tags.id,
      });

      tagId = newTag[0].id;
    }

    //link tag and repo atomic values
    await db
      .insert(repo_to_tags)
      .values({
        repo_id: repoId,
        tag_id: tagId,
      })
      .onConflictDoNothing();
  }
}
