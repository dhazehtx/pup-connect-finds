import { Request, Response } from 'express';

// Simple verification endpoint for debugging
export function simpleVerificationStart(req: Request, res: Response) {
  try {
    console.log('[SIMPLE VERIFICATION] Request body:', req.body);
    console.log('[SIMPLE VERIFICATION] Request headers:', req.headers);
    
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ 
        error: 'Provider ID is required',
        received: req.body 
      });
    }
    
    // Just return success for now
    res.json({
      success: true,
      message: 'Simple verification endpoint working',
      providerId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[SIMPLE VERIFICATION] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}