import type { Request, Response } from 'express';

// Link media paths to the latest verification row
export async function linkVerificationMedia(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { providerId, frontPath, backPath } = req.body;
  
  if (!providerId || (!frontPath && !backPath)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // For now, log the media linking (would update database in real implementation)
    console.log('Linking verification media:', {
      providerId,
      frontPath,
      backPath
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Link media error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Server error' 
    });
  }
}