import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';

import webhookRoutes from './routes/webhooks.route';
import trendingRoutes from './routes/trending.route';
import discoverRoutes from './routes/discover.route';
import findIssues from './routes/find-issues.route';
import findGSOC from './routes/gsoc.route';
import trackPrsRoutes from './routes/track-prs.route';
import trackIssuesRoutes from './routes/track-issues.route';

const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.json());

app.use('/api/webhooks', webhookRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/findIssues', findIssues);
app.use('/api/findGSOC', findGSOC);
app.use('/api/track-prs', trackPrsRoutes);
app.use('/api/track-issues', trackIssuesRoutes);
// app.use('/api/dashboard/');
app.get('/', (req: Request, res: Response) => {
  res.send('SourceSurf API is running');
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
