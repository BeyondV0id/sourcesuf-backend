import express from 'express';
import {Request,Response} from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
const app = express();
const PORT = process.env.PORT || 4000;
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.all('/auth/*', toNodeHandler(auth));
app.get('/', (req:Request, res:Response) => {
  res.send('SourceSurf API is running');
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
