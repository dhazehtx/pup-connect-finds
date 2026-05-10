import type { AuthUser } from './authUser';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      isAuthenticated(): boolean;
      skipAuth?: boolean;
    }
  }
}

export {};
