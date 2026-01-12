import { Response, Request, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      res.status(401).json({
        error: 'Unauthorized',
      });
      return;
    }
    res.locals.session = session;
    next();
  } catch (e) {
    console.error('Auth middlewaer error', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
