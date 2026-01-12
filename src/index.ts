import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';

import webhookRoutes from './routes/webhooks.route';
import trendingRoutes from './routes/trending.route';
import discoverRoutes from './routes/discover.route';
import findIssues from './routes/findIssues.route';
import ycRoutes from './routes/yc.route';
import findGSOC from './routes/GSOC.route';

const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use('/auth/{*any}', toNodeHandler(auth));

app.use('/api/webhooks', webhookRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/yc-oss', ycRoutes);
app.use('/api/findIssues', findIssues);
app.use('/api/findGSOC', findGSOC);

app.get('/', (req: Request, res: Response) => {
  res.send('SourceSurf API is running');
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
