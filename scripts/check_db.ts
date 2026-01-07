
import { db } from '../src/db/client';
import { trending_repos } from '../src/db/schemas/trending';
import { repos } from '../src/db/schemas/repos';

async function main() {
  console.log('Checking database...');
  const allRepos = await db.select().from(repos);
  console.log(`Total repos in DB: ${allRepos.length}`);

  const trending = await db.select().from(trending_repos);
  console.log(`Total trending entries: ${trending.length}`);
  
  if (trending.length > 0) {
    console.log('Sample trending:', trending.slice(0, 5));
  } else {
    console.log('No trending repositories found.');
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
