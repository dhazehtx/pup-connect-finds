import { Router } from 'express';
import { sessionTimeout } from '../middleware/sessionTimeout';
import { storage } from '../storage';

const router = Router();

/**
 * Auth refresh endpoint for session management
 * Updates user last activity and validates session
 */
router.post('/refresh', async (req, res) => {
  try {
    // Extract user ID from request body or session
    const userId = req.body?.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'User ID not found in request' 
      });
    }

    // Update user's last activity
    await storage.updateProfile(userId, {
      updated_at: new Date(),
      last_login_ip: req.ip || req.connection.remoteAddress || 'unknown'
    });

    res.json({ 
      success: true, 
      message: 'Session refreshed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to refresh session' 
    });
  }
});

/**
 * Session status check endpoint
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.query?.user_id as string || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        authenticated: false,
        message: 'No user session found' 
      });
    }

    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ 
        authenticated: false,
        message: 'User profile not found' 
      });
    }

    // Check session validity (15 minutes)
    const now = Date.now();
    const lastActive = new Date(profile.updated_at!).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    const isExpired = now - lastActive > fifteenMinutes;

    res.json({
      authenticated: !isExpired,
      user_id: userId,
      last_active: profile.updated_at,
      session_expired: isExpired,
      time_remaining: isExpired ? 0 : fifteenMinutes - (now - lastActive)
    });
  } catch (error) {
    console.error('Session status check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check session status' 
    });
  }
});

export default router;