import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export async function requireAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch the profile from the database to check is_admin
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin')
      .eq('id', userId)
      .single();

    if (error || !profile || !profile.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach profile to request for downstream use
    (req as any).profile = profile;
    return next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
