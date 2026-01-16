import { User } from 'better-auth/types';

declare global {
  namespace Express {
    interface Locals {
      session?: {
        user?: User;
      };
    }
  }
}

export {};
