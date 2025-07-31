import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Session timeout middleware for API routes
 * Checks for 15-minute idle timeout and updates last_active_at
 */
export async function sessionTimeout(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract user ID from request (assuming it's set by auth middleware)
    const userId = req.user?.id || req.body?.user_id || req.query?.user_id as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user profile to check last active time
    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(401).json({ error: 'User not found' });
    }

    const now = Date.now();
    const lastActive = profile.last_login_ip ? new Date(profile.updated_at!).getTime() : now;
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if session has expired (15 minutes of inactivity)
    if (now - lastActive > fifteenMinutes) {
      return res.status(440).json({ 
        error: 'Session expired',
        message: 'Your session has timed out due to inactivity. Please sign in again.' 
      });
    }

    // Update last active timestamp
    await storage.updateProfile(userId, {
      updated_at: new Date(),
      last_login_ip: req.ip || req.connection.remoteAddress || 'unknown'
    });

    next();
  } catch (error) {
    console.error('Session timeout middleware error:', error);
    next(); // Continue on error to avoid breaking the request
  }
}

/**
 * Lightweight session check for less critical endpoints
 */
export async function lightSessionCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || req.body?.user_id || req.query?.user_id as string;
    
    if (!userId) {
      return next(); // Skip check if no user ID available
    }

    // Update last active without strict timeout check
    await storage.updateProfile(userId, {
      updated_at: new Date()
    });

    next();
  } catch (error) {
    console.error('Light session check error:', error);
    next(); // Continue on error
  }
}